# Practice module

The Cairo-time practice calendar, session detail, venue, and one-tap RSVP experience (prompt 804).
The backend owns every projection (counts, capacity, deadline, waitlist); the client presents what it
is given, stores and transports instants in UTC, and renders them in Africa/Cairo.

## Public surface (`index.ts`)

| Export                                                              | Purpose                                                        |
| ------------------------------------------------------------------- | -------------------------------------------------------------- |
| `getPracticeRouteDefinitions`                                       | Calendar + detail routes for the app router.                   |
| `practicesPath` / `practiceSessionPath`                             | Typed navigation targets (list and deep-linkable detail).      |
| `practiceQueryKeys`                                                 | Query-key builders for cache reads and invalidation.           |
| `practiceSessionListResponseSchema` / `…DetailSchema` / `upcoming…` | Wire contracts shared by remote NestJS mode and MSW mock mode. |
| `PRACTICE_TYPE` / `PRACTICE_STATUS` / `RSVP_STATUS` / `RSVP_REASON` | Domain vocabularies (as-const, never TypeScript enums).        |
| `PracticeSessionSummary` / `PracticeSessionDetail`                  | App-owned domain types.                                        |

## Anatomy

```text
constants/practice-api.constants.ts        endpoint paths (list, upcoming, detail, rsvp)
constants/practice.constants.ts            domain vocabularies + i18n label maps + filter options
schemas/practice-session.schema.ts         wire contracts (Zod), UTC ISO instants, nullable projections
mappers/practice-session.mapper.ts         DTO → domain (pure, 100% covered), renames instants to …Iso
gateways/practice.gateway.ts               authenticated calls; list carries bounded, allowlisted params
services/*.service.ts                      one use case each; HttpError → AppError (incl. 409 → CONFLICT)
queries/practice.keys.ts|*.query.ts        key builders + query options (upcoming cached for offline)
hooks/use-*-query.hook.ts                  query hooks
hooks/use-practice-calendar.hook.ts        calendar view model (filters, scope, bounded pagination)
hooks/use-practice-session-details.hook.ts detail view model + RSVP flow wiring
mutations/use-rsvp-mutation.hook.ts        optimistic update + rollback + invalidation + conflict recovery
helpers/*.helper.ts                        pure view-model builders (Cairo grouping, RSVP state machine)
components/*                               UI-only (calendar, cards, filter bar, venue, agenda, RSVP)
containers/*.container.tsx                 composition (one hook + one component)
routes/practice.paths.ts|.routes.ts        APP_PATHS builders + permission-guarded route table
```

## Query contract and RSVP flow

- `GET /practices/sessions?scope&type&rsvp&pageSize` returns a bounded, deterministically ordered page.
- `GET /practices/sessions/upcoming` returns the bounded upcoming list, cached for offline reads.
- `GET /practices/sessions/:id` returns the full detail incl. venue, agenda preview, privacy-safe counts,
  status, last update, and the member's RSVP state (with an optimistic-concurrency `version`).
- `PUT /practices/sessions/:id/rsvp` takes `{ status, reasonCategory, version }` and returns the updated
  detail. A stale `version` returns `409` → a `CONFLICT` AppError; the mutation rolls back the optimistic
  patch and invalidates the cache so the member re-answers against the authoritative latest state.

## Invariants

- UTC stored/transported; Africa/Cairo presented through the date package owner (DST-aware).
- `null` means "unknown / not set" and is never coerced to zero (counts, capacity, waitlist position).
- Permission-guarded: routes require `practices.read`; the RSVP action requires `practices.rsvp.self`.
- RSVP after the deadline is disabled with an explanation; controls prevent duplicate submits.
- Errors reach the UI as translated copy from the error code, never as raw backend text.
- Calendar-subscription guidance never exposes private coach notes.

## Tests

- Unit: colocated `*.test.ts(x)`.
- Contract: [practice wire contract](../../../tests/contract/practice.contract.test.ts).
- Integration: [practice RSVP flow](../../../tests/integration/practice-rsvp-flow.integration.test.tsx).

## Related

- Rules: [02-feature-modules](../../../rules/02-feature-modules.md),
  [15-server-state-and-queries](../../../rules/15-server-state-and-queries.md).
