# Practice module

The Cairo-time practice calendar, session detail, and one-tap RSVP experience (prompt 804). Remote
and mock modes consume the backend's committed team-scoped OpenAPI contract exactly. Instants stay
in UTC over the wire and render in Africa/Cairo.

## Public surface (`index.ts`)

| Export                                                                | Purpose                                                    |
| --------------------------------------------------------------------- | ---------------------------------------------------------- |
| `getPracticeRouteDefinitions`                                         | Calendar + detail routes for the app router.               |
| `practicesPath` / `practiceSessionPath`                               | Typed navigation targets.                                  |
| `practiceQueryKeys`                                                   | Team-scoped cache key builders.                            |
| `practiceSessionListResponseSchema` / `practiceSessionResponseSchema` | Exact list and session response DTOs.                      |
| `practiceRsvpResponseSchema`                                          | Exact self-RSVP response DTO.                              |
| `PRACTICE_TYPE` / `PRACTICE_STATUS` / `RSVP_STATUS` / `RSVP_REASON`   | App domain vocabularies (as-const, never TypeScript enum). |
| `PracticeSessionSummary` / `PracticeSessionDetail`                    | App-owned domain types.                                    |

## Anatomy

```text
constants/practice-api.constants.ts        team-scoped list, detail, and RSVP path builders
constants/practice.constants.ts            domain vocabularies + i18n labels + filter options
schemas/practice-session.schema.ts         exact Session/ListSessions/Rsvp response DTO schemas
mappers/practice-session.mapper.ts         generated DTO vocabulary → app domain
gateways/practice.gateway.ts               generated request types + exact authenticated calls
services/*.service.ts                      use cases; resource composition; HttpError → AppError
queries/practice.keys.ts|*.query.ts        team-scoped keys + query options
hooks/use-*-query.hook.ts                  query hooks
hooks/use-practice-team-context.hook.ts    team id from the authenticated membership query
hooks/use-practice-calendar.hook.ts        filters, scope, and bounded pagination
hooks/use-practice-session-details.hook.ts detail view model + RSVP wiring
mutations/use-rsvp-mutation.hook.ts        optimistic RSVP patch + rollback + invalidation
helpers/*.helper.ts                        pure Cairo-time and RSVP view-model builders
components/*                               UI-only calendar, detail, and RSVP controls
containers/*.container.tsx                 one screen hook wired to one component
routes/practice.paths.ts|.routes.ts        APP_PATHS builders + team/permission guards
```

## Query contract and RSVP flow

- `GET /teams/:teamId/practice-sessions?from&to&sessionType&status&limit&offset` returns
  `ListSessionsResponseDto`.
- There is no backend `upcoming` route. Upcoming reads use that list endpoint with `from` and a
  limit of five.
- `GET /teams/:teamId/practice-sessions/:sessionId` returns `SessionResponseDto`; the member's RSVP
  is loaded separately from `GET .../:sessionId/rsvp`.
- `PUT .../:sessionId/rsvp` takes `SetRsvpDto` (`expectedVersion`, not the removed frontend
  `version` wire field) and returns `RsvpResponseDto`, not a session detail.
- The bounded calendar joins every returned session with its self-RSVP resource. The generated list
  DTO has no RSVP filter, so that optional UI filter applies only to the loaded bounded page.

## Invariants

- UTC stored/transported; Africa/Cairo presented through the date package owner.
- Every cache key includes `teamId`; one team never reuses another team's practice cache.
- The route requires membership context. Until a team selector exists, the first authenticated
  membership is the deterministic active scope.
- `null` means unknown/not set and is never coerced to zero.
- Venue, agenda, aggregate counts, and waitlist position are absent from the committed session
  contract, so existing unknown/empty states render instead of invented data.
- Routes require `practices.read`; RSVP actions require `practices.rsvp.self`. The session detail
  offers an Attendance CTA only to `attendance.record` holders; its label follows the session's own
  schedule (record before the end instant, view after) and the sheet state itself is resolved on
  the capture screen — no extra roster read from the detail view. The capture path is derived
  locally from the canonical route table because the attendance module already consumes this
  module's public surface (importing back would create a cycle).
- RSVP after the cutoff is disabled; controls prevent duplicate submits.
- Errors render translated `AppErrorCode` copy, never raw backend messages.

## Tests

- Unit: colocated `*.test.ts(x)`.
- Contract: [practice wire contract](../../../tests/contract/practice.contract.test.ts).
- Integration: [practice RSVP flow](../../../tests/integration/practice-rsvp-flow.integration.test.tsx).
- E2E: [practice experience](../../../tests/e2e/practice.spec.ts).

## Related

- Rules: [02-feature-modules](../../../rules/02-feature-modules.md),
  [15-server-state-and-queries](../../../rules/15-server-state-and-queries.md).
