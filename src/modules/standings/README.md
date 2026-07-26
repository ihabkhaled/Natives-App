# Standings module

Competition standings tables, immutable versioned point rules, the governed achievements approval
workflow, and the member-facing trophy cabinet (P4 wave 1). Remote and mock modes consume the
backend's team-scoped **standings** contract exactly; the server derives every table and decides
every approval.

Owner personas: **Member/Scorekeeper** read standings and the trophy cabinet; **Coach** manages
competition results (recompute, external rows, rule versions, claims and approvals); **Analyst**
reads standings for reporting; **Team Admin** adds the audited historical import.

## The rules that shape everything here

**Rules are immutable versions.** Publishing a point rule always creates version N+1 of its family —
nothing here edits a version, and a stored table is only ever sorted by the rule version it cites.
The table footer names that version; the rules screen states the invariant in copy.

**Provenance is visible.** A `derived` row is the quiet default. A `manual` or `import` row carries
a badge whose disclosure reveals the mandatory reconciliation note, the source reference, who
recorded it, and when — the backend refuses such a row without the note, and the form says why.

**Only approved achievements are history.** The trophy cabinet renders exactly what the endpoint
returns: approved, non-staff entries. No approval chrome exists there by design. The workspace's
transition bar is a display-only mirror of the backend state machine (draft → submitted → approved →
archived; submitted → rejected terminal) — the UI offers a subset, the server decides. Every
transition carries `expectedRecordVersion`; a conflict refetches and re-asks, never overwrites. A
rejection may carry a `reason`, persisted as the claim's terminal `rejectionReason`.

**The client derives one number.** The ± column (points for − against) is display-only and labelled
as such. Ranks, points, and qualification all arrive from the server; a null spirit score renders as
"—", never zero.

**Navigation is honest.** `/standings` and `/standings/rules` are `competition.read`; `/team-history`
is `team.read`; `/achievements` (nav and guard) is `competition.manage`, so a Member's navigation
stays clean — their achievement surface is the cabinet. The backend re-authorizes every call.

## Public surface (`index.ts`)

- `getStandingsRouteDefinitions` — the four route definitions above.
- `standingsPagePath` / `standingsRulesPagePath` / `achievementsPagePath` / `teamHistoryPagePath`.
- `standingsQueryKeys` — team-scoped cache keys.
- Wire schemas (`standingResponseSchema`, `achievementResponseSchema`, …) — pinned by
  `tests/contract/standings.contract.test.ts`.
- Closed vocabularies (`STANDING_TIE_BREAKS`, `ACHIEVEMENT_STATUSES`, …) mirrored from the backend
  enums.

## Layout

`constants → schemas → mappers → gateways → services (one use case each) → queries → mutations →
hooks → helpers (pure, 100% covered) → components (dumb) → containers → routes`. MSW handlers live
in `src/tests/msw/standings-handlers.ts` with fixtures in `standings.fixture.ts` /
`achievements.fixture.ts`; integration flows in `tests/integration/standings-*.integration.test.tsx`
and `achievements-*.integration.test.tsx`; e2e in `tests/e2e/standings.spec.ts`.

The trophy cabinet is the only screen in this wave allowed to use the gold accent — "gold is spent
on achievements" (points module README rule).
