# Members module

The searchable member directory, audience-tiered profiles, avatar lifecycle, admin lifecycle actions,
privilege-ceiling role assignment, aliases, status history, and self profile editing (prompt 806).
Remote and mock modes consume the backend's team-scoped members contract exactly; the server remains
the sole authority and shapes every profile to the viewer's resolved audience.

## Public surface (`index.ts`)

| Export                                                                       | Purpose                                        |
| ---------------------------------------------------------------------------- | ---------------------------------------------- |
| `getMembersRouteDefinitions`                                                 | Directory + profile routes for the app router. |
| `membersPath` / `memberProfilePath`                                          | Typed navigation targets.                      |
| `membersQueryKeys`                                                           | Team-scoped cache key builders.                |
| `memberViewResponseSchema` / `memberDirectoryListResponseSchema`             | Exact profile + directory response DTOs.       |
| `membershipResponseSchema` / `memberHistoryResponseSchema`                   | Lifecycle + history response DTOs.             |
| `memberRolesResponseSchema`                                                  | Roles + assignable-ceiling response DTO.       |
| `MEMBERSHIP_STATUS` / `MEMBER_ROLE` / `MEMBER_AUDIENCE` / `LIFECYCLE_ACTION` | App vocabularies (as-const).                   |
| `MemberDirectoryPage` / `MemberProfile` / `MemberRoles`                      | App-owned domain types.                        |

## Anatomy

```text
constants/members-api.constants.ts      team-scoped directory, profile, lifecycle, media path builders
constants/members.constants.ts          domain vocabularies + i18n labels + tones + filter options
schemas/member.schema.ts                exact directory/view/membership/history/alias/avatar/roles DTOs
mappers/member.mapper.ts                generated DTO vocabulary -> app domain
gateways/members.gateway.ts             exact authenticated calls (React-free)
services/*.service.ts                   one use case each; HttpError -> AppError via runMembersRequest
queries/members.keys.ts|*.query.ts      team-scoped keys + query options
hooks/use-members-directory.hook.ts     search/status/position filters + invite wiring
hooks/use-member-profile.hook.ts        audience-tiered profile + avatar/lifecycle/roles/aliases/history
hooks/use-member-*.hook.ts              panel view models (each composes query + mutation + local state)
mutations/use-update-profile-mutation.hook.ts  optimistic self-edit patch + rollback + invalidation
helpers/*.helper.ts                     pure filter, status, view-model, ceiling, and format builders
components/*                            UI-only directory, cards, profile, panels, and forms
containers/*.container.tsx              one screen hook wired to one component
routes/members.paths.ts|.routes.ts      APP_PATHS builders + permission/team guards
```

## Contract and audience shaping

- `GET /teams/:teamId/members?limit&offset` returns `ListMembersResponseDto` (privacy-safe rows only).
- `GET /teams/:teamId/members/:membershipId` returns `MemberViewResponseDto` shaped to the viewer's
  `audience` (public/teammate/self/coach/admin); fields the viewer may not see are `null`.
- `PATCH .../:membershipId/profile` takes `{ profile, expectedVersion }`; a stale version is a 409.
- `POST .../:membershipId/{activate|deactivate|suspend|leave|archive}` returns `MembershipResponseDto`.
- `GET .../:membershipId/history` returns the append-only status timeline (lifecycle managers only).
- `POST|GET .../:membershipId/aliases`, `DELETE .../aliases/:aliasId` manage aliases (alias managers).
- `GET|PUT .../:membershipId/roles` reads/writes roles plus the actor's `assignableRoles` ceiling.
- Avatar: `POST .../avatar` (signed ticket), `PUT .../avatar/:mediaId` (attach), `GET .../avatar`
  (signed download URL or null). Broken/expired images fall back to initials.

## Invariants

- Every cache key includes `teamId`; one team never reuses another team's members cache.
- The directory is bounded, deterministically ordered, and virtualized (the module owns the list).
- Search/status/position filters apply client-side to the loaded bounded page.
- `null` means unknown/not provided and is never coerced to zero; hidden restricted fields are omitted.
- Role assignment is privilege-ceiling aware: toggles above the actor's ceiling are disabled.
- Self edit uses an optimistic cache patch with rollback and conflict reconciliation.
- Errors render translated `AppErrorCode` copy, never raw backend messages.

## Tests

- Unit: colocated `*.test.ts(x)`.
- Contract: [members wire contract](../../../tests/contract/members.contract.test.ts).
- Integration: [directory flow](../../../tests/integration/members-directory-flow.integration.test.tsx),
  [profile flow](../../../tests/integration/member-profile-flow.integration.test.tsx).
- E2E: [members experience](../../../tests/e2e/members.spec.ts).

## Related

- Rules: [02-feature-modules](../../../rules/02-feature-modules.md),
  [15-server-state-and-queries](../../../rules/15-server-state-and-queries.md),
  [ui-ux-quality-mandate](../../../rules/ui-ux-quality-mandate.md).
