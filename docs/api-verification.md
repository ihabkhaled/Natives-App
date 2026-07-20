# API verification — client against the live NestJS backend

Executed against the sibling backend `Natives-Backend` booted locally
(`npm run db:setup` + `npm run start:dev`, Postgres container `natives-postgres-dev`) and the web
client running in **remote** mode (`VITE_API_MODE=remote`,
`VITE_API_BASE_URL=http://localhost:3000/api/v1`).

- Date: 2026-07-20
- Backend routes enumerated from the Nest `RouterExplorer` boot log (243 mapped routes).
- Client responses were exercised twice: through the real UI (Playwright drove login → home →
  practice → members → settings → devices → sign-out and every `/api/v1/**` response was recorded)
  and directly against the endpoints the UI's gateways call, to compare the DTO field sets against
  the client Zod schemas.

Seed data created through the API for the check: team `ultimate-natives`, two memberships, one
published practice session, RSVP and attendance records.

## Result table

| Flow                  | Endpoint (client gateway)                                                             | Method  | Result                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| Login                 | `/auth/login`                                                                         | POST    | **works** — 200, tokens + user parsed, redirect to `/home`                                    |
| Session bootstrap     | `/auth/refresh`                                                                       | POST    | **works** — schema matches (`accessToken`, `refreshToken`, `refreshTokenExpiresAt`, `userId`) |
| Current user          | `/auth/me`                                                                            | GET     | **works** — 200; all seven fields present and parsed                                          |
| Device sessions       | `/auth/sessions`                                                                      | GET     | **works** — 200, list renders on `/sessions`                                                  |
| Sign out              | `/auth/logout`                                                                        | POST    | **works** — 200 from the new app-bar account menu, back to `/login`                           |
| Health card           | `/health`                                                                             | GET     | **drift fixed** — see _Drift 1_                                                               |
| Effective permissions | `/rbac/me/permissions`                                                                | GET     | **works** — 200, 90 permissions                                                               |
| Dashboard summary     | `/dashboard/summary`                                                                  | GET     | **backend-pending** — 404, route not implemented (_Gap 1_)                                    |
| Practice calendar     | `/teams/{teamId}/practice-sessions`                                                   | GET     | **works** — 200, envelope + every session field matches                                       |
| Practice detail       | `/teams/{teamId}/practice-sessions/{sessionId}`                                       | GET     | **works** — 200, all 24 fields match the client schema                                        |
| RSVP read             | `/teams/{teamId}/practice-sessions/{sessionId}/rsvp`                                  | GET     | **works** — 200                                                                               |
| RSVP write            | `/teams/{teamId}/practice-sessions/{sessionId}/rsvp`                                  | PUT     | **works** — 200 on a published session (409 `rsvpClosed` on a draft, as designed)             |
| Attendance roster     | `/teams/{teamId}/practice-sessions/{sessionId}/attendance`                            | GET     | **works** — 200, sheet envelope matches                                                       |
| Attendance mark       | `/teams/{teamId}/practice-sessions/{sessionId}/attendance/{membershipId}`             | PUT     | **works** — 200                                                                               |
| Attendance bulk       | `/teams/{teamId}/practice-sessions/{sessionId}/attendance/bulk`                       | POST    | **works** — 200, client already sends `{ marks: [...] }`                                      |
| Attendance finalize   | `/teams/{teamId}/practice-sessions/{sessionId}/attendance/finalize`                   | POST    | **works** — optimistic concurrency honoured (409 on a stale `expectedVersion`)                |
| Attendance history    | `/teams/{teamId}/practice-sessions/{sessionId}/attendance/{membershipId}/history`     | GET     | **works** — 200                                                                               |
| Member directory      | `/teams/{teamId}/members`                                                             | GET     | **works** — 200, paginated envelope matches                                                   |
| Member detail         | `/teams/{teamId}/members/{membershipId}`                                              | GET     | **works** — 200                                                                               |
| Member history        | `/teams/{teamId}/members/{membershipId}/history`                                      | GET     | **works** — 200                                                                               |
| Member aliases        | `/teams/{teamId}/members/{membershipId}/aliases`                                      | GET     | **works** — 200                                                                               |
| Member avatar ticket  | `/teams/{teamId}/members/{membershipId}/avatar`                                       | GET     | **works** — 200                                                                               |
| Member invite         | `/teams/{teamId}/members/invite`                                                      | POST    | **works** — 201, client already sends `{ profile: {...} }`                                    |
| Member profile update | `/teams/{teamId}/members/{membershipId}/profile`                                      | PATCH   | **works** — client already sends `{ profile, expectedVersion }`                               |
| Member lifecycle      | `/teams/{teamId}/members/{membershipId}/activate` (and the sibling lifecycle actions) | POST    | **works** — 200                                                                               |
| Member roles          | `/teams/{teamId}/members/{membershipId}/roles`                                        | GET/PUT | **backend-pending** — 404, route not implemented (_Gap 2_)                                    |
| Team context          | `/auth/me` → `memberships[]`                                                          | GET     | **backend-pending** — always `[]` (_Gap 3_)                                                   |

## Drift found and fixed on the client

### Drift 1 — `GET /health` has no `version`

The deployed probe answers:

```json
{ "status": "ok", "uptimeSeconds": 413, "timestamp": "2026-07-20T14:29:30.489Z" }
```

The client schema required `version: string (min 1)`, so every remote-mode response failed
validation and the home screen's API-health card rendered its error state even though the request
returned 200.

Fixed on the client only:

- `src/modules/health/schemas/health.schema.ts` — `version` is optional, `uptimeSeconds` accepted.
- `src/modules/health/types/health.types.ts` + `mappers/health.mapper.ts` — `version: string | null`.
- `src/modules/health/components/health-status-card/*` — the version row is omitted when the server
  does not report one; the status badge and checked-at row are unchanged.

Verified after the fix: the card renders **Operational — Checked: July 20, 2026 6:36 PM** against the
live backend, and mock mode (which still sends a version) is unchanged.

No other DTO drift was found: every other response the UI consumes parsed cleanly with the existing
schemas. Two request bodies that look like candidates for drift (`attendance/bulk` and
`members/{id}/profile`) were checked field-by-field against the Nest DTOs and already match
(`marks[]`, `{ profile, expectedVersion }`).

## Backend-pending (recorded, not faked)

These stay on mock data in `VITE_API_MODE=mock`; nothing was stubbed to make them look live.

### Gap 1 — `GET /dashboard/summary` is not implemented

Not present in the mapped route table; returns `404 errors.http.notFound`. The dashboard screen
therefore renders its designed error state in remote mode and its full widget board in mock mode.
The client contract (`src/modules/dashboard/schemas/dashboard.schema.ts`) is ready for the projection
as specified.

### Gap 2 — member roles endpoint is not implemented

`src/modules/members/constants/members-api.constants.ts` builds
`/teams/{teamId}/members/{membershipId}/roles`, which returns 404. The backend currently models role
assignment under `/rbac/assignments` and `/rbac/users/{userId}/assignments`, which is a different
resource shape (user-scoped, not membership-scoped). The member profile's roles panel is left on the
membership-scoped contract and works in mock mode; migrating it to `/rbac/**` needs a product
decision about mapping a membership to a user id, so it was not changed here.

### Gap 3 — `/auth/me` never returns memberships

`Natives-Backend/src/modules/identity/lib/identity.mapper.ts` hardcodes `memberships: []`. The client
derives the active team from `user.memberships[0].teamId`
(`src/modules/practice/hooks/use-practice-team-context.hook.ts` and the members/attendance
equivalents) and `useEffectivePermissions().hasTeamContext` gates every team-scoped destination.

Consequence in remote mode: practice calendar, attendance, and the member directory render the
"Select a team" guard state and are hidden from the sidebar, even for an administrator who owns an
active membership row in the database. The endpoints themselves are correct — they were exercised
directly with a real team, session, RSVP, and attendance sheet and all match the client schemas (see
table). Once the backend populates `memberships`, those screens light up with no client change.

### Gap 4 — resolved: roster endpoints landed mid-implementation (prompt 810)

Recorded here because the state changed during the work. The competitions and squads surface —
competitions, structure, fixtures, opponents, squads, eligibility, selections, selection override,
availability, and squad transitions — was published from the start and is consumed live. Roster
paths were **absent** at the 196-path revision of `contracts/openapi.json`, so the squad workspace
originally shipped a non-persisted match-day preview.

A `npm run contract:sync` (the documented refresh, run against the sibling backend; the backend repo
was not modified) brought the contract to **208 paths**, including the full roster surface:
`/teams/{teamId}/rosters` and `.../{rosterId}` plus `entries`, `entries/override`,
`entries/{membershipId}/removal`, `availability`, `validation`, `snapshots`, `lock`, `revision`,
`transition`, and `rosters/match`. The preview was replaced with a live roster module
(`src/modules/competitions` gateways `rosters.gateway.ts`, list route `/rosters`, workspace route
`/rosters/:rosterId`) covering roster list, entries, validation violations, availability, lifecycle
(publish / lock / archive) and snapshot history. The `squads.rosterPendingNotice` copy now describes
the squad panel as a read-only mirror of the live roster rather than a pending mock.

One contract break surfaced from the sync and was fixed at the root cause: the backend now reuses
`RosterEntryResponseDto` for competition roster entries, so `src/tests/msw/attendance.fixture.ts`
was typing its rows off the wrong generated DTO. It now derives them from the client's own
`attendanceSheetResponseSchema` output type.

### Gap 5 — the tryouts module is not deployed (prompt 813)

No tryout path exists in the published contract and the backend tryouts module (prompts 600/601) is
not implemented. The whole tryout screen set — public candidate registration with consent capture,
staff event list, candidate roll, check-in, evaluator scoring, decision/offer, and member
conversion — therefore runs **mock-only**, against NestJS-shaped MSW handlers
(`src/tests/msw/tryouts-handlers.ts`) that are validated by the same Zod schemas
(`src/modules/tryouts/schemas/tryout.schema.ts`) that will parse the remote responses.

The client contract this was written against:

| Endpoint                                                      | Method | Purpose                                                    |
| ------------------------------------------------------------- | ------ | ---------------------------------------------------------- |
| `/public/tryout-events`                                       | GET    | Events open to public registration (no session).           |
| `/public/tryout-registrations`                                | POST   | Register with `consentVersion` + `consentGiven`.           |
| `/teams/{teamId}/tryouts`                                     | GET    | Staff event list with capacity and waitlist counts.        |
| `/teams/{teamId}/tryouts/{tryoutId}`                          | GET    | One event.                                                 |
| `/teams/{teamId}/tryouts/{tryoutId}/candidates`               | GET    | Privacy-safe roll (no contacts, no readiness).             |
| `/teams/{teamId}/tryouts/{tryoutId}/candidates/{candidateId}` | GET    | Detail; `contacts`/`readiness` are null without the grant. |
| `.../candidates/{candidateId}/check-in`                       | POST   | Day-of check-in.                                           |
| `.../candidates/{candidateId}/evaluations`                    | POST   | Scores (`null` = not scored) + evaluator note.             |
| `.../candidates/{candidateId}/decision`                       | POST   | `accept`/`waitlist`/`decline` with a reason.               |
| `.../candidates/{candidateId}/conversion`                     | POST   | Idempotent member conversion.                              |

Privacy is enforced in the shape, not only in the UI: the list DTO has no contact or readiness
field, and the detail DTO carries them as nullable blocks the server omits for a caller without
`tryout.contacts.read` / `tryout.readiness.read`. The mock handler reproduces that behaviour from
the persona bearer token, so the forbidden path is exercised by the integration tests.

Switching to the live service when it ships is a configuration change (`VITE_API_MODE=remote`) plus
a `npm run contract:sync`; no screen, hook, or schema is expected to change.

## Reproducing

```bash
# backend
cd Natives-Backend && npm run db:setup && npm run start:dev

# client against it
cd Natives-App && VITE_API_MODE=remote npm run dev
```

Seed administrator credentials come from the backend `.env` (`SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD`).
