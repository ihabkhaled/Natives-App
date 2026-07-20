# Competitions module

Competition visibility (leagues, championships, friendlies with their stages, rounds, fixtures, and
opponents) plus the constrained, explainable season-squad tools: advisory eligibility signals,
selection with a reason-bearing coach override, availability windows, publish/lock/revise, and the
live match-day rosters (prompt 810). Remote and mock modes consume the backend competitions
contract exactly; the server remains the sole authority for eligibility policy and every write.

## Public surface (`index.ts`)

| Export                                                                        | Purpose                                           |
| ----------------------------------------------------------------------------- | ------------------------------------------------- |
| `getCompetitionsRouteDefinitions`                                             | Competition, squad, and roster routes.            |
| `competitionsPath` / `competitionDetailPath` / `squadsPath` / `rostersPath` … | Typed navigation targets.                         |
| `competitionsQueryKeys`                                                       | Team-scoped cache key builders.                   |
| `competition*ResponseSchema` / `fixtureListResponseSchema`                    | Exact competition, structure, fixture DTOs.       |
| `squad*ResponseSchema` / `eligibilityReportResponseSchema`                    | Squad, eligibility, selection, availability DTOs. |
| `COMPETITION_STATUSES` / `SQUAD_STATUSES` / `ELIGIBILITY_STATUSES` …          | App vocabularies (as-const, never TS enums).      |
| `Competition` / `Squad` / `EligibilityCandidate` / `SquadSelection` …         | App-owned domain types.                           |

## Anatomy

```text
constants/competitions.constants.ts        vocabularies, paging windows, override reason minimum
constants/competitions-api.constants.ts    team-scoped competition, squad, selection path builders
constants/competitions-labels.constants.ts i18n key maps, tones, and the shared state-copy namespaces
schemas/competition.schema.ts              exact competition / structure / fixture / opponent DTOs
schemas/squad.schema.ts                    exact squad / eligibility / selection / availability DTOs
mappers/*.mapper.ts                        wire DTO -> app domain (drops opponent contact fields)
gateways/*.gateway.ts                      exact authenticated calls (React-free)
services/*.service.ts                      one use case each; HttpError -> AppError
queries/competitions.keys.ts|.query.ts     team-scoped keys + query options
hooks/use-competitions-*.hook.ts           list + detail screen view models
hooks/use-squad-*.hook.ts                  workspace, selection panel, availability panel, lifecycle
mutations/*.hook.ts                        select / override / remove, declare availability, transition
helpers/eligibility-view.helper.ts         the advisory row builder and the null-attendance rule
helpers/override-dialog.helper.ts          the reason-gated override dialog model
helpers/roster-view.helper.ts              roster entries, violations, availability rows
components/*                               UI-only cards, panels, tables
containers/*.container.tsx                 one screen hook wired to one component
routes/competitions.paths.ts|.routes.ts    APP_PATHS builders + permission/team guards
```

## Contract

- `GET /teams/:teamId/competitions?limit&offset` → `ListCompetitionsResponseDto`.
- `GET .../competitions/:competitionId` and `.../structure` → competition + stages/rounds.
- `GET .../competitions/:competitionId/fixtures` → fixtures with `scheduledAt` (UTC) and Cairo time.
- `GET /teams/:teamId/opponents` → opponent directory. Contact fields are **not** parsed by the
  client schema, so they can never reach a component.
- `GET /teams/:teamId/squads`, `.../:squadId`, `.../eligibility`, `.../selections`, `.../availability`.
- `POST .../selections` (policy-clean pick), `POST .../selections/override` (`overrideReason`
  required, min 5), `POST .../selections/:membershipId/removal`.
- `POST .../availability` (self declaration), `POST .../transition` (`publish|lock|revise|archive`
  with `expectedRecordVersion`; a stale token is a 409).
- `GET /teams/:teamId/rosters`, `.../:rosterId`, `.../entries`, `.../availability`, `.../validation`,
  `.../snapshots`.
- `POST .../entries` and `.../entries/override` (reason-bearing), `.../entries/:membershipId/removal`,
  `.../lock`, `.../revision`, `.../transition`.

## Invariants

- **Eligibility signals are advisory, never an exclusion.** A candidate whose overall verdict is
  `failed` is still selectable; the UI routes that pick through the override dialog, which will not
  confirm without a reason of at least five characters. Without `squad.override_eligibility` the
  action is disabled and says why — it is never silently hidden.
- A null `attendancePct`, `jerseyNumber`, or `availability` renders "not enough data" / "unassigned"
  / "not declared". Nothing missing is ever presented as 0.
- Rosters are **live**: the roster surface landed in `contracts/openapi.json` during this work (see
  `docs/api-verification.md`, gap 4). The squad screen keeps a read-only roster mirror; the roster
  workspace at `/rosters/:rosterId` owns entries, validation violations, lifecycle, and snapshots.
- Validation violations are **reported, never enforced client-side**: an `error` violation is shown
  in full and publish still asks the server, the only authority that can refuse it.
- Every cache key includes `teamId`; one team never reuses another team's competition cache.
- Lifecycle actions confirm first and send `expectedRecordVersion`, so a stale client loses to a 409
  instead of overwriting another coach's revision.
