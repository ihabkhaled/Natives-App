# Analytics module

Governed, chart-ready read models (P4 wave 1): per-player and per-team series across 15 dimensions,
a privacy-safe cohort comparison, and an idempotent projection rebuild. Remote and mock modes
consume the backend's team-scoped **analytics** contract exactly.

Owner personas: **Coach** and **Analyst** read team trends and player trajectories; **Team Admin**
adds the rebuild (`data_quality.manage`); **Member** reads exactly their own player series
(`analytics.read.self`, contract 1.6.0 dual gate) via the profile link or a deep URL.

## The rules that shape everything here

**The client never computes a statistic.** Every series arrives with its `unit`, `direction`,
`benchmarkLabel`, server-authored `summary`, and `calculationVersion`, all cited verbatim in the
chart footer. Cohort min/avg/max are server numbers or absent — nothing is ever derived client-side.

**Suppression is a feature.** A cohort below the privacy threshold (5) arrives `suppressed: true`
with null stats; the panel replaces its tiles with the privacy notice. There is no workaround by
design.

**A gap is a gap.** A null series value breaks the SVG line into a new sub-path and draws no marker;
the gap notice appears below and the accessible `ChartDataTable` twin names the missing period. The
line never dips to zero for an unevaluated period.

**Charts are in-house SVG.** Geometry lives in pure helpers
(`helpers/series-chart.helper.ts`); components are dumb. Sparse x-ticks keep a 30-point monthly
series legible on a phone, and `[dir='rtl']` mirrors the canvas per the app-wide chart convention.

**The rebuild is dual-gated.** The button exists only for
`analytics.read.team` + `data_quality.manage` holders (absent, not disabled), mirrors the DTO's
monthly default, and its success surface cites the run's own report before invalidating every
analytics query.

**Navigation is honest.** `/analytics` is `analytics.read.team` (nav, Team group). The player route
carries no client permission: the backend dual-gates it, and the screen renders the designed
forbidden or not-found state — never a blank chart.

## Public surface (`index.ts`)

- `getAnalyticsRouteDefinitions` — both route definitions.
- `analyticsPagePath` / `playerAnalyticsPath` / `playerAnalyticsPattern`.
- `analyticsQueryKeys` — team-scoped cache keys.
- Wire schemas (`analyticsSeriesResponseSchema`, …) — pinned by
  `tests/contract/analytics.contract.test.ts`.
- Closed vocabularies (`ANALYTICS_DIMENSIONS`, `DIMENSION_GROUPS`, `TEAM_ONLY_DIMENSIONS`, …).

## Layout

`constants → schemas → mappers → gateways → services (one use case each) → queries → mutations →
hooks → helpers (pure, 100% covered) → components (dumb) → containers → routes`. MSW handlers live
in `src/tests/msw/analytics-handlers.ts` (fixtures in `analytics.fixture.ts`, including a null-gap
series and both cohort states); integration flows in
`tests/integration/team-analytics-flow.integration.test.tsx` and
`player-analytics-flow.integration.test.tsx`; e2e in `tests/e2e/analytics.spec.ts`.
