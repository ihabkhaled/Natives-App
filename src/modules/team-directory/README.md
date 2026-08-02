# Team directory module

Owns the public `/team` page: the Ultimate Natives masthead, the Season Board
26/27 grouped by responsibility, and the active roster — built against the
response contract 1.8.0 pins for the public team-directory endpoint, which is
not deployed yet.

## Public surface (`index.ts`)

| Export                             | Purpose                                               |
| ---------------------------------- | ----------------------------------------------------- |
| `getTeamDirectoryRouteDefinitions` | `/team` (public).                                     |
| `teamDirectoryPath`                | Typed path builder.                                   |
| `mapTeamDirectoryResponse`         | Wire → domain normalizer, shared with contract tests. |
| `teamDirectoryQueryKeys`           | Query-key builder for cache invalidation.             |
| `TEAM_DIRECTORY_SLUG`              | The `{slug}` this deployment reads.                   |
| `TeamDirectory*` DTO + view types  | The backend shape the future gateway will parse.      |

## Anatomy

```text
team-directory.constants.ts              seam flag, slug, staff-title catalog + order
constants/team-directory-seed.constants.ts  pinned season board, shaped as the wire DTO
types/team-directory.types.ts            wire DTOs + normalized domain
types/team-directory-view.types.ts       card / group / hero / screen view models
mappers/team-directory.mapper.ts         DTO → domain (trim, blank→null, roster order)
helpers/staff-groups.helper.ts           group the board by responsibility
helpers/team-directory-view.helper.ts    domain + t() → translated view models
services/load-team-directory.service.ts  THE TODO SEAM
queries/team-directory.{keys,query}.ts   query key + options builder
hooks/use-team-directory-query.hook.ts   normalized remote read
hooks/use-team-directory-screen.hook.ts  translated screen view model
components/person-avatar/*               portrait or branded initials medallion
components/directory-card/*              one person card
components/directory-card-grid/*         the responsive auto-fit grid
components/staff-group-list/*            titled bands of staff cards
components/team-profile-hero/*           masthead: facts, tagline, socials
components/team-directory-view/*         UI-only screen
containers/team-directory.container.tsx  composition
routes/team-directory.paths.ts           typed builder over APP_PATHS
```

## The TODO seam

`GET /public/teams/{slug}/directory` (@Public; team profile, staff-with-titles,
active players) is specified in contract 1.8.0 but is not in this repo's
generated types yet. Rather than invent a gateway call to a route the client
cannot type, `loadTeamDirectory(slug)` takes the exact slug the real endpoint
takes and resolves the pinned `TEAM_DIRECTORY_SEED_RESPONSE` — already shaped as
`TeamDirectoryResponseDto` — through `mapTeamDirectoryResponse`, the same mapper
the live response will pass through.

Wiring the real endpoint is a **one-file change** in
`services/load-team-directory.service.ts`:

```ts
const dto = await requestTeamDirectory(slug); // gateway + response schema
return mapTeamDirectoryResponse(dto);
```

...plus flipping `TEAM_DIRECTORY_ENDPOINT_LIVE` to drop the "coming soon"
notice, and deleting `constants/team-directory-seed.constants.ts`. The query,
both hooks, every view model, and every component are unchanged, because they
already consume the mapped domain.

`src/tests/msw/team-directory-handlers.ts` already answers that exact route with
a full payload (portraits, positions, an unknown title code), and
`tests/integration/team-directory-flow.integration.test.tsx` drives the mapper
and the screen from that response — so the day the gateway lands, the contract
is already covered.

## Invariants

- `photoUrl` is nullable on purpose. Until the season-board images land in
  `src/assets/staff/`, every card renders the branded initials medallion at the
  same size and in the same lime-ringed frame as a real portrait; the fallback
  is a design state, never a broken image.
- Titles are the team's **corrected** responsibilities, not the words printed
  on the season-board images (the images say "CAPTAIN"/"CO CAPTAIN"; the team
  confirmed Coach/Co-Coach).
- A person may hold several titles and appears in every matching group.
- A title code this client does not know yet lands in a trailing "Team staff"
  group rather than vanishing.
- Only `https://` profiles are ever linked out of the public hero.
- Route access is `Public`, not `PublicOnly`: the page reads the same signed in
  or out.

## Related

- Rules: [02-feature-modules](../../../rules/02-feature-modules.md),
  [06-services-use-cases](../../../rules/06-services-use-cases.md),
  [15-server-state-and-queries](../../../rules/15-server-state-and-queries.md),
  [21-i18n-rtl](../../../rules/21-i18n-rtl.md).
