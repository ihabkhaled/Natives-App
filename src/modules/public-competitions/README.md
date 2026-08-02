# Public competitions module

Owns the signed-out competitions showcase: the competitions the team entered with the team's
finish, each competition's match results (expandable into per-match individual player scores), and
the per-competition individual leaderboard. Read-only, unauthenticated, and not yet wired to a live
endpoint.

## Route note (read this before moving anything)

The public pages live at **`/results`** and **`/results/:competitionSlug`**, not `/competitions`.
`/competitions` and `/competitions/:competitionId` already belong to the authenticated competitions
workspace (`src/modules/competitions`), and two route definitions cannot share a path — the router
renders whichever matches first, so claiming `/competitions` would make the signed-in workspace
unreachable. Moving the showcase onto `/competitions` later is a two-value change in
`APP_PATHS.publicCompetitions` / `APP_PATHS.publicCompetitionDetail`, once the authenticated screen
has moved off those paths.

## Public surface (`index.ts`)

| Export                                               | Purpose                                         |
| ---------------------------------------------------- | ----------------------------------------------- |
| `getPublicCompetitionsRouteDefinitions`              | `/results` and `/results/:competitionSlug`.     |
| `publicCompetitionsPath`, `publicCompetitionDetail*` | Typed path builders.                            |
| `MATCH_OUTCOME`, `MatchOutcome`                      | Outcome tokens the view models carry.           |
| `Public*ScreenView`, `Public*RowView`                | View-model types, for tests and factories.      |
| `Public*Dto`                                         | The contract-1.8.0 shapes the gateway will use. |

## Anatomy

```text
constants/public-showcase.constants.ts        outcome tokens/tones, seam flag, slug param
constants/public-showcase-seed.constants.ts   the seam's stand-in payload (EUNC/EUDL 2026)
constants/public-showcase-state.constants.ts  test ids for the five designed async states
types/public-showcase.types.ts                wire DTOs, pinned ahead of the real endpoints
types/public-competitions-view.types.ts       view models + label blocks
services/list-public-competitions.service.ts  TODO seam 1: the competition list
services/get-public-competition.service.ts    TODO seam 2: one competition's results
queries/public-competitions.{keys,query}.ts   TanStack Query keys + options
mappers/public-competition.mapper.ts          summary -> card view
mappers/public-results.mapper.ts              matches, player scores, leaderboard rows
helpers/public-showcase-copy.helper.ts        translated label blocks + shared state copy keys
hooks/use-public-competitions-screen.hook.ts  list view model
hooks/use-public-competition-detail.hook.ts   detail view model + row expansion state
components/*                                  UI-only views, cards, and tables
containers/*                                  composition
routes/public-competitions.{paths,routes}.ts  typed builders + Public route definitions
```

## The TODO seam (contract 1.8.0)

The backend public showcase endpoints are being built right now and are **not** in this repo's
generated contract. Rather than invent gateway calls to routes that do not exist, the two service
files are stubs that resolve the seeded competitions locally and make no network request at all —
an integration test asserts exactly that (MSW runs with `onUnhandledRequest: 'error'`, so a stray
call would fail the suite).

Wiring the real endpoints up is a **one file per data source** change:

| Seam                                           | Expected endpoint                          |
| ---------------------------------------------- | ------------------------------------------ |
| `services/list-public-competitions.service.ts` | `GET /public/showcase/competitions`        |
| `services/get-public-competition.service.ts`   | `GET /public/showcase/competitions/{slug}` |

For each: keep the exported signature, replace the body with a gateway `request*` call
(`@/packages/http`) parsed through a response schema, and delete the seed import. Then flip
`PUBLIC_SHOWCASE_LIVE` in `constants/public-showcase.constants.ts` to hide the "not connected yet"
notice. Queries, mappers, hooks, components, and every test above the service stay untouched — they
already speak the DTO shapes in `types/public-showcase.types.ts`.

## Invariants

- **Nothing is invented.** EUNC 2026 and EUDL 2026 are the two competitions the spec says the team
  entered; every fact the spec does not state (rank, field size, venue, format, dates) is `null`,
  and `rank === null` is what drives the designed "Results pending" chip. A public results page that
  guesses is worse than one that says it does not know yet.
- **Scores never reverse in Arabic.** Score pairs go through `formatScorePair` from
  `@/packages/number`, which wraps `8 – 6` in a bidi isolate; without it the neutral dash resolves
  right-to-left inside an Arabic paragraph and `8 – 6` renders as `6 – 8`. A screen-reader-only line
  spells out both sides, so nobody has to infer a result from a dash.
- **The client never ranks.** Competition finishes and leaderboard ranks are rendered exactly as the
  server sends them; the leaderboard meter is a share of the leader's points and is decorative
  (`aria-hidden`) — the table cells carry the numbers.
- **No chart library.** The leaderboard visualization is the repo's own CSS-meter idiom drawn inside
  the real `<table>`, so the data and the picture cannot drift apart and no tabular alternative is
  needed on top.
- Route access is `Public`, not `PublicOnly`: the showcase reads the same signed in or out.

## Related

- Rules: [02-feature-modules](../../../rules/02-feature-modules.md),
  [06-services-use-cases](../../../rules/06-services-use-cases.md),
  [ui-ux-quality-mandate](../../../rules/ui-ux-quality-mandate.md).
