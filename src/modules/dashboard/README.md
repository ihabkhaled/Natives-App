# Dashboard module

Personalized, permission-aware home dashboards for the member, coach, and administrator personas.
The backend returns one summary projection; the client only presents it and never recalculates a
score, rank, or attendance percentage.

## Public surface (`index.ts`)

| Export                           | Purpose                                                    |
| -------------------------------- | ---------------------------------------------------------- |
| `DashboardContainer`             | Embeddable dashboard (rendered by the home screen).        |
| `DASHBOARD_WIDGET_KIND`          | Stable widget identifiers shared with the mock projection. |
| `dashboardQueryKeys`             | Query-key builder for cache invalidation.                  |
| `dashboardSummaryResponseSchema` | Wire contract, shared by remote and mock modes.            |
| `DashboardSummary`               | App-owned domain type.                                     |

## Anatomy

```text
constants/dashboard-api.constants.ts       endpoint path
constants/dashboard-widgets.constants.ts   typed widget registry (title + permission per kind)
schemas/dashboard-summary.schema.ts        wire contract (Zod discriminated union)
mappers/dashboard-summary.mapper.ts        DTO → domain (pure, 100% covered)
gateways/dashboard.gateway.ts              authenticated projection call
services/get-dashboard-summary.service.ts  use case; HttpError → AppError
queries/dashboard.keys.ts|.query.ts        key builder + query options
hooks/use-dashboard-summary-query.hook.ts  query hook
hooks/use-dashboard.hook.ts                translated, permission/offline-aware view model
helpers/dashboard-view-model.helper.ts     pure widget filtering + view building + state machine
components/dashboard-view/                  states + persona header (UI-only)
components/dashboard-widget*/               registry-driven widget cards (no monolithic conditional)
components/dashboard-metric|breakdown|task-list/  the three presentations
containers/dashboard.container.tsx          composition
```

## Query contract and widget ownership

- `GET /dashboard/summary` returns `{ persona, generatedAt, widgets[] }`. Each widget is a
  discriminated union on `presentation` (`metric` | `breakdown` | `tasks`) with a stable `kind`,
  a `status`, and a per-widget `asOf` freshness instant.
- The client owns the title and required permission per `kind` in `DASHBOARD_WIDGET_REGISTRY`.
  Personas differ only by which registered widgets their grants unlock; unknown kinds are dropped.

## Invariants

- No client score/rank/attendance recalculation: numeric projections arrive as `displayValue`.
- `null` means "not evaluated" and renders muted, never as zero.
- Permission-aware: a widget appears only when the effective session holds its permission. The
  backend re-authorizes every read regardless of what the shell shows.
- Deep links: a widget may declare a footer link into its owning screen (member-attendance →
  `/my-attendance`, member-feedback → `/performance/feedback`, coach-attention → `/practices`).
  The link renders only when the viewer holds the TARGET route's permission; widget bodies stay
  non-clickable.
- Freshness-aware: the header shows the projection time and each card its own `as of`.
- Every widget carries an accessible presentation; breakdowns are real tables with a caption and
  row headers (the tabular alternative to a chart).
- Errors reach the UI as translated copy from the error code, never as raw messages.

## Tests

- Unit: colocated `*.test.ts(x)`.
- Contract: [dashboard wire contract](../../../tests/contract/dashboard.contract.test.ts).
- Integration: [dashboard summary flow](../../../tests/integration/dashboard-summary-flow.integration.test.tsx).

## Related

- Rules: [02-feature-modules](../../../rules/02-feature-modules.md),
  [15-server-state-and-queries](../../../rules/15-server-state-and-queries.md).
