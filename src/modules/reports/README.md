# Reports module

Asynchronous generation of the team's 10 governed report templates (CSV/XLSX/PDF) with a full job
lifecycle and a short-lived signed download URL minted per request (P4 wave 1). Remote and mock
modes consume the backend's team-scoped **reports** contract exactly.

Owner personas: **Analyst** (primary) and **Team Admin** request exports, monitor jobs, and
download; Coach/Member/Scorekeeper have no surface (`report.read` is absent — the route is hidden
and a direct URL is guarded).

## The rules that shape everything here

**The client never invents job state.** Status, progress, and the retry budget all arrive from the
job state machine (`queued → running → completed|failed`, `failed → retry ≤ 3`, `completed →
expired`). Every job ends terminal, so an endless spinner is impossible.

**The artifact never streams through the app.** Downloading calls the download endpoint
imperatively **per click** and never caches the URL — each mint is a fresh 15-minute signed link,
audited server-side. The toast cites the checksum tail; `errors.reports.notReady` refetches the row,
`errors.reports.expired` flips it to its expired state.

**Polling is the app's first `refetchInterval`.** The list query polls every 4 s while any visible
job is `queued|running`, degrades to 15 s (with a "safe to leave" note) after five continuous
minutes on the same job, and stops entirely when idle, offline, or the tab is hidden
(`refetchIntervalInBackground: false`). The decision is a pure helper
(`helpers/reports-poll.helper.ts`), so it is unit-tested without fake timers. A manual refresh is
always present.

**Realistic controls only.** The request panel is a radio-card catalog of the 10 templates with
privacy chips and a format segment preselecting each template's default — never a raw key/value
payload editor. `failureReason` is shown verbatim, never interpreted.

**Navigation is honest.** `/reports` is `report.read` (nav, Manage group); the request/retry/
download buttons are additionally gated on `report.generate` in the context hook. The backend
re-authorizes every call.

## Public surface (`index.ts`)

- `getReportsRouteDefinitions` — the reports-center route definition.
- `reportsPagePath`.
- `reportsQueryKeys` — team-scoped cache keys (list poll + deep-linked job).
- Wire schemas (`reportJobResponseSchema`, …) — pinned by
  `tests/contract/reports.contract.test.ts`.
- `TEMPLATE_CATALOG` + closed vocabularies (`REPORT_STATUSES`, `REPORT_FORMATS`, …), pinned against
  the OpenAPI enums.

## Layout

`constants → schemas → mappers → gateways → services (one use case each) → queries (poll fn) →
mutations → hooks → helpers (pure, 100% covered) → components (dumb) → containers → routes`. MSW
handlers live in `src/tests/msw/reports-handlers.ts` with a stateful fixture that advances
queued → running → completed over N polls (plus failure and expired scenarios); the flow test is
`tests/integration/reports-center-flow.integration.test.tsx`; e2e in `tests/e2e/reports.spec.ts`.
