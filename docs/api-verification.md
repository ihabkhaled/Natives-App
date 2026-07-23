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

### Gap 6 — the operations centre has two surfaces the backend has not published (prompt 814)

The admin operations centre (`/admin/operations`) is mostly live. Published and consumed against the
real contract:

| Endpoint                         | Method | Used by                                 |
| -------------------------------- | ------ | --------------------------------------- |
| `/admin/outbox/metrics`          | GET    | Queue depth and dead-letter counters.   |
| `/admin/outbox/{eventId}/replay` | POST   | Re-queue one dead-lettered event by id. |
| `/teams/{teamId}/audit`          | GET    | The audit log panel.                    |

Contract 1.2.0 shipped the two formerly pending surfaces for real, shaped exactly like the Zod
schemas the app already validated (`src/modules/admin/schemas/operations.schema.ts`); the
capability-honesty markers in `admin-api.constants.ts` are now OFF and both panels query live:

| Endpoint                     | Method | Purpose                                                                 |
| ---------------------------- | ------ | ----------------------------------------------------------------------- |
| `/admin/outbox/dead-letters` | GET    | The listing behind the dead-letter counter (id, type, `failureCode`).   |
| `/admin/jobs/health`         | GET    | Heartbeat-derived job status (`healthy`/`degraded`/`failed`, last run). |

Contract 1.2.0 also added the platform super-admin roster the admin module now manages
(`GET/POST /rbac/platform/super-admins`, `DELETE /rbac/platform/super-admins/{userId}` with the
last-admin 409 `errors.rbac.lastSuperAdmin`), the team-scoped invitation route
(`POST /teams/{teamId}/invitations` with a ceiling-validated `teamRole`), and the assignable-roles
catalog (`GET /rbac/teams/{teamId}/assignable-roles`) that feeds the invite form's role select.

Privacy is encoded in the shape rather than only in the UI. A dead letter carries an event id, an
event type, an attempt count, and a failure code — the DTO has **no payload field at all**, so a
handler or a screen cannot leak an event body by mistake. Replay addresses the event by id. The audit
`diff` is reduced to a changed-field _count_ in `src/modules/admin/mappers/operations.mapper.ts`; no
changed value ever reaches a view model.

Switching either to the live service is a `npm run contract:sync` plus deleting the corresponding
MSW handler; no screen, hook, or schema is expected to change.

### Gap 7 — governance, jerseys, private imports, and reports are not built (prompts 603-604, 701-705)

These four admin sub-surfaces have no backend module and, deliberately, **no frontend screen**. They
were scoped out rather than shipped against fabricated data: no route, no `APP_PATHS` entry, no
navigation entry, and no mock handler exists for any of them. The admin hub advertises only the four
surfaces that are real — team settings, roles and access, rule governance, operations centre —
because `src/modules/admin/helpers/hub-cards.helper.ts` filters cards on the same grants the route
guards use, so the hub can never point at a screen that does not exist.

They remain deferred work:

| Surface                               | Backend prompt | Frontend state                   |
| ------------------------------------- | -------------- | -------------------------------- |
| Governance (positions, meetings)      | 603            | Not built — no screen, no mocks. |
| Jerseys (products, orders, conflicts) | 604            | Not built — no screen, no mocks. |
| Private imports (redacted dry runs)   | 702-705        | Not built — no screen, no mocks. |
| Reports (catalog, queue, downloads)   | 701            | Not built — no screen, no mocks. |

### Notifications — live, not pending (prompt 815)

Recorded here for completeness because it is the counter-example: the whole notification surface is
published and consumed live.

| Endpoint                     | Method  | Used by                              |
| ---------------------------- | ------- | ------------------------------------ |
| `/notifications`             | GET     | The bounded inbox window.            |
| `/notifications/{id}/read`   | POST    | Idempotent read state.               |
| `/notifications/preferences` | GET/PUT | The category × channel matrix.       |
| `/notifications/quiet-hours` | GET/PUT | Quiet hours and the urgent override. |

The contract carries no per-channel delivery state for a recipient, so the inbox claims none: it
reports in-app delivered/read, which it actually holds, and says plainly that email and push delivery
state is not exposed to recipients. Delivery _failures_ are administrative and live in the operations
centre; the link to it appears only for a principal holding `notification.delivery.read`.

### Matches — live scoring and derived statistics (prompts 811-812)

Every read and write the scoreboard, the offline scorekeeper, and the statistics screen make is a
published backend route. Nothing on these two screens runs on a fabricated endpoint.

| Endpoint                                           | Method | Used by                                         |
| -------------------------------------------------- | ------ | ----------------------------------------------- |
| `/teams/{teamId}/matches`                          | GET    | The bounded match list.                         |
| `/teams/{teamId}/matches/{matchId}/scoreboard`     | GET    | The authoritative score, caps, and timeouts.    |
| `/teams/{teamId}/matches/{matchId}/events`         | GET    | The append-only point timeline.                 |
| `/teams/{teamId}/matches/{matchId}/events/point`   | POST   | One idempotent scoring command.                 |
| `/teams/{teamId}/matches/{matchId}/events/timeout` | POST   | One idempotent timeout command.                 |
| `/teams/{teamId}/matches/{matchId}/events/void`    | POST   | The compensating correction behind undo.        |
| `/teams/{teamId}/matches/{matchId}/transition`     | POST   | The server-owned state machine.                 |
| `/teams/{teamId}/matches/{matchId}/finalization`   | POST   | Publishing the final, immutable score.          |
| `/teams/{teamId}/match-rulesets`                   | GET    | Every cap and allowance the scoreboard prints.  |
| `/teams/{teamId}/matches/{matchId}/statistics`     | GET    | The derived per-team and per-player projection. |

The idempotency contract is honoured rather than approximated. Each scoring command carries a
client-minted `operationId` and the `expectedStreamVersion` the operator was looking at; the server
answers `applied`, `replayed`, or a 409. The client treats `replayed` as success **without moving the
score**, and surfaces a 409 as a conflict the operator resolves — it never merges two divergent
scores. `tests/contract/matches.contract.test.ts` asserts all three outcomes against the MSW wire
using the same Zod schemas that parse the remote responses.

#### Contract-snapshot drift, not a gap

`contracts/openapi.json` in this repository is the 503 snapshot and does not yet carry the 504
statistics and point-lineup routes, which the sibling backend has since published (`MatchPoints.*`
and `MatchStatistics.get` are in its mapped route table). The client therefore validates
`/statistics` against schemas written from the shipped `MatchStatisticsResponseDto` rather than from
the committed snapshot, which is why `npm run contract:check` reports drift locally. Running
`npm run contract:sync` refreshes the snapshot; no schema, mapper, or screen is expected to change.

### Invitations — email-first onboarding, honest token delivery (prompt 802)

The invitation flow is email-first end to end and was verified against the live backend:

| Endpoint                    | Method | Shape                                                                                  |
| --------------------------- | ------ | -------------------------------------------------------------------------------------- |
| `/invitations`              | POST   | Body is `{ email, role? }` only — a `password` field is rejected by the DTO whitelist. |
| `/invitations/{id}/resend`  | POST   | Re-mints the token; the previous link is invalidated.                                  |
| `/auth/invitations/{token}` | GET    | Public, minimal pending details (email, role, inviter, expiry) — never the token.      |
| `/invitations/accept`       | POST   | Body is `{ token, password }`; the **invitee** chooses the password (policy enforced). |

The admin never sets a password; the invitee sets their own on acceptance and is issued a session.
The acceptance UI (`src/modules/auth/components/accept-invitation-view`) collects password + confirm
with strength/policy feedback and shows a generic invalid/expired/used state for a bad token.

#### Invitation email is sent automatically — console transport until a provider ships (OD-002)

Creating or resending an invitation now **sends the email as part of the same request**; there is no
separate delivery step. Both use cases call `SendInvitationEmailService` after their transaction
commits, which renders the message
(`Natives-Backend/src/modules/identity/domain/invitation-email.template.ts`) and hands it to
`EmailSenderPort`.

No email provider is contracted (open decision **OD-002**), so the port is bound to
`ConsoleEmailSenderService`, which writes the rendered message — recipient, subject, body, action URL
— to the structured log at `info`. Selection is configuration, not a call-site branch:
`EMAIL_PROVIDER` (default `console`) picks the adapter and `WEB_BASE_URL` (default
`http://localhost:5173`) is the origin the accept link is built against. Swapping in a real provider
is one new adapter plus one `case` in `selectSender` — no use case, controller, or test changes. The
full procedure is in `Natives-Backend/docs/product/open-decisions.md` under "OD-002 stand-in".

The **create and resend responses still return the plaintext `token` once**. That is deliberate and
remains the fallback: `AppLogger` redacts `token=`
assignments, so the console transport's logged link has its one-time credential censored — a live
invitation credential must not sit in a log file. While `EMAIL_PROVIDER=console`, the API response is
where the usable link comes from, and the logged `notice` field says exactly that. The database still
stores only the token's SHA-256 hash and no read path ever returns it. When OD-002 is resolved, a real
adapter sends the same rendered message and the token can be dropped from the response with no change
to the acceptance screen. Backed by `Natives-Backend/test/identity.e2e-spec.ts` plus unit specs for
the template, the sender service, the console adapter, and provider selection.

**No client copy changed, because there is no invite-link screen to change.** The only "invite" UI in
the client is `src/modules/members/components/member-invite-form`, which creates a _member record_
(`fullName`/`nickname`/`jersey`) against the members module — it never calls `/invitations` and never
receives or displays a token. No screen currently frames "share this link" as the primary action, so
there was nothing to reword. Building a dedicated admin screen for `POST /invitations` that shows
"an email was sent to {email} — you can also copy the link" is genuinely absent work, recorded under
_Gap 9_ below rather than faked here.

### Gap 9 — "where is the page to …": four screens existed but were unreachable, three are genuinely absent

The owner reported five capabilities as missing screens. Investigating them found a single root cause
behind most of it, plus a smaller set of real gaps.

**Root cause — the client permission catalog had drifted from the backend's.**
`src/shared/security/permissions.constants.ts` carried strings the backend never emits
(`practices.read` vs `practice.read`, `settings.read` vs `team.settings.read`, `points_rule.manage`
vs `points.rules.manage`, `outbox.manage` vs `jobs.manage`, `attendance.mark` vs `attendance.record`,
`users.manage` — no equivalent at all). A permission the backend never emits is never granted, so
`hasAllPermissions` reads it as denied: the route guard returns the forbidden state and
`nav-visibility.helper` hides the entry — for _every_ persona, including a full system administrator.

Confirmed live against the seeded backend: signed in as the seeded admin (90 effective permissions),
`/practices` rendered "You do not have access" while `GET /teams/{id}/practice-sessions` returned 200.
Correcting the strings restored, in one change, the practice calendar **and** four admin screens that
had been built but were invisible: **Admin**, **Team settings**, **Rules**, and **Operations**.
`tests/contract/permissions.contract.test.ts` now pins every client permission against the catalog the
backend publishes in `contracts/openapi.json`, so this class of drift fails the contract gate.

Item by item:

| Asked for           | Finding                                                                                                                                              | Status                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Season list/detail  | Exists — the **Team settings** screen lists seasons via `GET /teams/{id}/seasons` (`admin/gateways/catalog.gateway.ts`). It was hidden by the drift. | **Fixed** (discoverability) |
| **Create** a season | Genuinely absent. Backend supports `POST/PATCH/DELETE /teams/{id}/seasons` (`season.manage`); the client gateway is read-only.                       | **Not built** — see below   |
| Users list          | Exists — the member directory at `/members` (`member.list`), reachable as **Members** in the Team nav.                                               | **Already present**         |
| Permissions matrix  | `/admin/roles` ("Roles and access") exists and was never hidden, but shows role _assignment_, not a catalog × bundle matrix.                         | **Blocked** — see below     |
| Create a team       | Genuinely absent in the client. Backend **does** model it: `POST /teams` gated on `team.settings.manage`.                                            | **Not built** — see below   |
| Attendance hub      | Only `/practices/:sessionId/attendance` exists, nested under one session with `nav: null`. No standalone hub or nav entry.                           | **Not built** — see below   |

#### Not built, and why — no faked screens

These are recorded rather than stubbed, because a screen that cannot complete its job is worse than an
honest gap:

- **Create/edit/delete a season.** The backend contract is complete, so this is purely client work: a
  form plus three gateway calls on the existing Team settings screen. Nothing blocks it; it was not
  built in this pass. It is the cheapest of the three to land next.
- **Create a team.** `POST /teams` exists and is permission-gated, so this is _not_ out of scope for
  the product shape — the earlier assumption that this install is single-team is wrong. A team
  creation screen also needs a team switcher to be useful: `usePracticeTeamContext` and
  `useActiveTeamScope` both silently pick the _first_ membership, so a second team would be
  unreachable in the UI even once created. Shipping creation without switching would produce exactly
  the dead end this note exists to avoid. Both should land together.
- **Permissions matrix.** This one is genuinely **blocked on the backend**. `/rbac/*` exposes
  assignment create/delete/list and `GET /rbac/me/permissions`, but there is **no endpoint returning
  the permission catalog or the role→permission bundles**. `ROLE_BUNDLES` is compiled into the
  backend and seeded into `roles`/`role_permissions`, never served. The full catalog is now published
  as an enum on `EffectivePermissionsResponseDto`, so the _columns_ are available — the _rows_ (which
  bundle grants what) are not. A matrix cannot be rendered truthfully without a
  `GET /rbac/roles` (or similar) returning each role with its permission keys. Recorded as a backend
  gap; no matrix screen was built against invented data.
- **Attendance hub.** The per-session attendance screen works. A hub needs a "sessions awaiting
  attendance" query the backend does not expose as such; it would have to be synthesized client-side
  by listing sessions and probing each one's attendance state, which is an N+1 the calendar already
  suffers from. Deferred pending a backend list endpoint.

#### Invitation admin screen

Also absent, as noted in the invitations section above: no client screen calls `POST /invitations`, so
there is no place to show "an email was sent to {email} — you can also copy the link". The backend
flow (including automatic sending) is complete and covered by tests.

### Gap 8 — video analysis is not implemented (prompt 505)

The backend exposes **no** clip, timestamp, tag, comment, or signed-URL route: nothing under
`/video`, `/analysis`, or `/clips` exists in the mapped route table. The statistics screen therefore
renders a clearly marked "Video analysis is not available yet" panel
(`src/modules/matches/components/video-gap-panel`) instead of inventing a player.

Nothing is faked for it: there is no route, no `APP_PATHS` entry, no gateway, no schema, and **no MSW
handler**. The panel states the surface is unavailable and points here; `tests/e2e/matches.spec.ts`
and the statistics integration suite both assert that notice is on screen, so the gap cannot be
quietly closed by mock data later. The `match.analysis.read.self` and `match.analysis.read.team`
grants are already resolved into the match context so the surface can be gated the day the endpoints
ship.

## 2026-07-21 — live re-verification against backend `a82002c`

Driven end to end through the real UI; the full route-by-route result is in
[docs/e2e-audit.md](e2e-audit.md). Only the API-level findings are recorded here.

### Now verified working

| Flow                  | Endpoint                                                      | Result                                                                                                                       |
| --------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Invite by email       | `POST /invitations`                                           | **works** — 201; the response carries the one-time token and the client turns it into an accept link. Gap 8 above is closed. |
| Accept invitation     | `POST /invitations/accept`                                    | **works** — a real invitation was accepted through the browser and issued a working session.                                 |
| Effective permissions | `GET /rbac/me/permissions?teamId=`                            | **works** — and is now the app's authorization source; see the drift below.                                                  |
| Role matrix           | `GET /rbac/role-bundles`                                      | **works** — 91 permissions x 6 role bundles at policy version 5. Powers `/admin/permissions`.                                |
| Teams                 | `GET/POST /teams`, `GET /teams/mine`, `PATCH /teams/{id}`     | **works** — platform reads/writes gate on `team.browse.all` / `team.create`; `/teams/mine` is the team-scoped read.          |
| Team lifecycle        | `POST /teams/{id}/activate                                    | deactivate                                                                                                                   | archive  | remove`                                                                                                        | **works** — `remove` only from archived, otherwise 409 `errors.teams.teamInvalidTransition`. |
| Seasons               | `GET/POST /teams/{t}/seasons`, `PATCH /teams/{t}/seasons/{s}` | **works**                                                                                                                    |
| Season lifecycle      | `POST /teams/{t}/seasons/{s}/activate                         | close                                                                                                                        | archive` | **works** — a second activation returns 409 `errors.teams.seasonAlreadyActive`; the screen states that reason. |

### Drift found and fixed on the client

**`/auth/me` carries only GLOBAL permissions.** For the seeded `teamadmin` persona it
returns 23; `GET /rbac/me/permissions?teamId=…` returns 81 for the same principal.
The client derived every route guard and every navigation entry from the first
set, so a team administrator saw an almost empty application.
`useEffectivePermissions` now takes the union of both sources. Full detail in
[docs/e2e-audit.md](e2e-audit.md) (D-1).

### Still backend-pending

| Endpoint                                       | Status                                                                                  |
| ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| `/teams/{id}/tryouts`, `/public/tryout-events` | 404. The tryouts screens render a designed "not deployed yet" notice; nothing is faked. |

(`/admin/outbox/dead-letters` and `/admin/jobs/health` left this table with contract 1.2.0 — both
are live and the operations centre queries them for real.)

### Backend data defect (no client workaround, and none wanted)

`GET /teams/fedb67b4-…/members` (the seeded `un` team) answers
`{ "items": [], "total": 1 }` — the envelope counts a membership the page does not
return, and `GET …/members/09e2f88a-…` answers 404 for the membership `/auth/me`
reports. The membership row exists; the members read model does not project it.
The client renders its designed empty state, which is correct for an empty page.
Recorded here for the backend owner.

### Environment note

Dev `CORS_ORIGIN` is `http://localhost:3000,http://localhost:5173`. Any other origin —
including `127.0.0.1:5173`, the same host by another name — fails the preflight, and
every request then dies as `net::ERR_FAILED` with no status code, which looks exactly
like a dead backend. Live-backend runs must use `localhost:5173`.

## Reproducing

```bash
# backend
cd Natives-Backend && npm run db:setup && npm run start:dev

# client against it
cd Natives-App && VITE_API_MODE=remote npm run dev
```

Seed administrator credentials come from the backend `.env` (`SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD`).
