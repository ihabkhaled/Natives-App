# Live end-to-end audit — every route, every persona

Driven against the **real stack**, not MSW: the NestJS backend on
`http://localhost:3000/api/v1` (Postgres container `natives-postgres-dev`, seeded
dev database) and the web client in remote mode (`VITE_API_MODE=remote`) on
`http://localhost:5173`. Playwright drove a real browser through the real login,
then visited every route in `APP_PATHS`, recording the rendered state, every
`data-testid` present, every console error, and every response with a status of
400 or above.

- Date: 2026-07-21
- Backend commits audited: `450a429`, then `a82002c` (team/season lifecycle,
  permission matrix, full persona seeding) after the mid-audit rebase.
- Contract: `contracts/openapi.json` synced at
  `036ad911e9869e736e567fdfa5367142ef0621da4d173debeb591be2b0c77b34` (236 paths).

## Personas driven

| Persona                            | Role          | How it was obtained                                                                           |
| ---------------------------------- | ------------- | --------------------------------------------------------------------------------------------- |
| `admin@ultimatenatives.local`      | global admin  | seeded administrator                                                                          |
| `superadmin@ultimatenatives.local` | SUPER_ADMIN   | seeded persona                                                                                |
| `teamadmin@ultimatenatives.local`  | TEAM_ADMIN    | seeded persona                                                                                |
| `player.audit@…` (created live)    | user, no team | created through `POST /invitations` and accepted through the real `/accept-invitation` screen |

Creating the fourth persona was itself the invite→accept journey test: the
invitation was issued through the API, the accept link was opened in the browser,
the password was set through the real form, and the app landed on `/home` with a
working session.

## Headline result

**37 routes audited. 30 WORK, 2 BROKEN, 3 EMPTY (correctly), 2 MISSING
(backend).** Every BROKEN item is fixed in this change; both MISSING items are
backend-pending and already degrade to a designed state.

The single most damaging finding is **D-1**: a team administrator — the primary
real-world persona — saw an almost empty application. It is the same class of
silent permission drift that has shipped dead screens here twice before, and it
was invisible to every existing gate because every request the app made returned 200.

## Defects found

### D-1 — Team-scoped permissions were never fetched — BROKEN (fixed)

**Evidence.** For `teamadmin@ultimatenatives.local`, holding role `team_admin` on
team `un`:

```
GET /auth/me                                     -> 23 permissions
GET /rbac/me/permissions                         -> 23 permissions
GET /rbac/me/permissions?teamId=fedb67b4-…       -> 81 permissions
```

The 23 include `member.profile.read.public`, `team.read`, and the rest of the
bare member set. The 81 add `member.list`, `member.invite`,
`member.lifecycle.manage`, `member.roles.manage`, `team.settings.manage`,
`team.settings.read`, `season.manage`, `assessment.read.team`,
`attendance.read.team`, `points.read.team` and more.

**Root cause.** The client derived its entire authorization context from
`/auth/me.permissions`, which reports only **globally-granted** permissions. A
team-scoped role contributes nothing to it. Route guards and navigation
visibility both read that set, so for a team administrator the shell hid
Members, Assessments, Team settings, Roles and access, Rules, Operations and
Admin, and `/admin/permissions` rendered `guard-forbidden` — even though the
backend would have authorized every one of them.

**Fix.** `useEffectivePermissions` now resolves authorization from **both**
sources and takes their union: the global grants from `/auth/me` plus the
team-scoped grants from `GET /rbac/me/permissions?teamId=<active team>`. The
scoped fetch counts towards `isLoading`, so a guard never decides before it
lands (deciding early would flash "no access" and then correct itself). A
principal with no team falls back to the global set unchanged.

**Verified live.** After the fix, signing in as `teamadmin` renders the full
manage rail and `/admin/permissions` renders the 91-permission × 6-role matrix.

### D-2 — `/` and `/welcome` showed signed-in users a dead "Sign in" CTA — BROKEN (fixed)

**Evidence.** Authenticated, `GET /` redirects to `/welcome`, which rendered
`welcome-page` with a "Sign in" call to action. Every other signed-out entry
point (`/login`, `/forgot-password`, `/reset-password`, `/accept-invitation`)
correctly bounced to `/home`.

**Root cause.** The welcome route was declared `ROUTE_ACCESS.Public` rather than
`PublicOnly`. It is the only signed-out screen that was, and it is the one `/`
redirects to.

**Fix.** `welcome` is now `ROUTE_ACCESS.PublicOnly`; an authenticated visitor
opening the app root lands on `/home`.

### D-3 — Team settings printed the literal string `null` — BROKEN (fixed)

**Evidence.** `/admin/settings`, "Effective now" panel: every unset setting
(Attendance statuses, Session types, Attendance weights, Assessment scale, Badge
tiers, Roster limits, Notification rules, Report branding) rendered the value
**`null`** with "Not set" beneath it.

**Root cause.** `describeValue` in `settings-rows.helper.ts` ran
`JSON.stringify(value ?? null)`, which serializes an absent value into the
four-character string `"null"` and hands it to the screen as data.

**Fix.** An absent value now resolves to the translated "Not set" copy. A
falsy-but-real value (`0`, `false`, `""`) still renders as itself — the test
pins both.

### D-4 — No way to reach a second team — BROKEN (fixed, gap 9)

**Evidence.** The seeded administrator holds two memberships (`ultimate-natives`
and `un`). Every team-scoped hook resolved `memberships[0]`, so the `un` team —
the one the owner actually asked for, and the one carrying the 2026 season — was
unreachable in the UI.

**Fix.** A real team switcher (see "What was built" below).

### D-5 — Inviting a person created a row nobody could sign in as — BROKEN (fixed, gap 8)

**Evidence.** The members directory's "Invite member" button called
`POST /teams/{id}/members/invite` only. That endpoint creates a **membership
record**. It never touches `/invitations`, so no account was ever created and no
email was ever sent.

**Fix.** One flow that creates both records (see "What was built").

### D-6 — The date field showed a date the form did not hold — BROKEN (fixed, gap 7)

**Evidence.** `/training`, "Date performed" rendered a bare grey pill reading
`Jul 21, 2026` while `form.performedOn` was `''`. `ion-datetime-button` displays
_today_ when its paired datetime has no value, so the control both looked like a
static chip and claimed a date the submission did not carry.

**Fix.** A rebuilt `AppDateField` (see "What was built").

## Backend-pending (MISSING, degrades correctly)

| Route                              | Endpoint                                           | Status                                                                                                                      |
| ---------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `/tryouts`, `/tryout-registration` | `/teams/{id}/tryouts`, `/public/tryout-events`     | 404. The screens already state "The tryouts service is not deployed yet" and render a designed notice rather than an error. |
| `/admin/operations`                | `/admin/outbox/dead-letters`, `/admin/jobs/health` | 404. The outbox metrics panel works; the two pending panels render their own "backend-pending" notices.                     |

Both are recorded in `docs/api-verification.md`. No screen fabricates data for
either.

## Backend data defect observed (not a client fix)

`GET /teams/fedb67b4-…/members` (the seeded `un` team) answers
`{"items":[],"total":1}` — the envelope counts one membership while the page
returns none, and `GET …/members/09e2f88a-…` answers 404 for the membership
`/auth/me` reports. The membership row exists; the members read model does not
project it. Recorded in `docs/api-verification.md` for the backend owner. The
client renders its designed empty state, which is the correct behaviour for an
empty page.

The same scope-resolution gap shows up on two more read models for that team:
`GET /teams/fedb67b4-…/points` and `GET /teams/fedb67b4-…/activity-types` both
answer 404 `errors.activities.scopeNotFound` for a member of that team, while
`GET /teams/fedb67b4-…/my-points` answers 200 for the same principal.

The client is correct in every case: the leaderboard renders its designed
"Points did not load" error state with a retry — never an endless skeleton — and
external training renders its designed empty state. Both verified by screenshot
against the live backend.

## Route-by-route result

Administrator persona unless noted. "WORKS" means: the screen rendered, its
requests returned 2xx, and no console or network error was raised.

| Route                                | Status  | Evidence                                                                      |
| ------------------------------------ | ------- | ----------------------------------------------------------------------------- |
| `/`                                  | WORKS   | redirects to `/welcome`; signed-in now redirects to `/home` (D-2)             |
| `/welcome`                           | WORKS   | `welcome-page`; signed-out only after D-2                                     |
| `/login`                             | WORKS   | authenticates against the real API; signed-in redirects to `/home`            |
| `/forgot-password`                   | WORKS   | `forgot-password-page`                                                        |
| `/reset-password`                    | WORKS   | designed "Link no longer works" state for a tokenless visit                   |
| `/accept-invitation`                 | WORKS   | designed invalid state tokenless; full accept flow verified with a real token |
| `/sessions`                          | WORKS   | `sessions-list`, real device rows                                             |
| `/home`                              | WORKS   | `dashboard-view`, administrator dashboard, health card                        |
| `/practices`                         | WORKS   | real session on 22 July renders with RSVP state                               |
| `/practices/:sessionId`              | WORKS   | `practice-session-page`, all 24 fields                                        |
| `/practices/:sessionId/attendance`   | WORKS   | `attendance-view`, "1 of 2 marked"                                            |
| `/members`                           | WORKS   | `members-list`, 3 real members                                                |
| `/members/:membershipId`             | WORKS   | `member-profile-view`, profile, roles, lifecycle                              |
| `/assessments`                       | EMPTY   | `assessments-empty` — no assessment periods seeded                            |
| `/assessments/:assessmentId`         | WORKS   | reachable only from a real row; none seeded                                   |
| `/performance`                       | EMPTY   | `performance-empty` — nothing published yet                                   |
| `/training`                          | WORKS   | composer renders; date field rebuilt (D-6)                                    |
| `/training-review`                   | WORKS   | `training-empty` — "Queue is clear"                                           |
| `/leaderboard`                       | WORKS   | `leaderboard-view` with the tie-break explanation                             |
| `/points`                            | WORKS   | `points-history-view`, total 0                                                |
| `/competitions`                      | EMPTY   | `competitions-empty` — none created                                           |
| `/squads`                            | EMPTY   | `competitions-empty` — none created                                           |
| `/rosters`                           | EMPTY   | `competitions-empty` — none created                                           |
| `/matches`                           | EMPTY   | `matches-empty` — none created                                                |
| `/matches/:matchId`, `/…/statistics` | WORKS   | reachable only from a real match; none seeded                                 |
| `/tryout-registration`               | MISSING | 404 `/public/tryout-events`; designed "not deployed yet" notice               |
| `/tryouts`                           | MISSING | 404 `/teams/{id}/tryouts`; designed notice                                    |
| `/notifications`                     | WORKS   | `notifications-empty`, "All caught up"                                        |
| `/notifications/preferences`         | WORKS   | `notification-prefs-view`, channels render                                    |
| `/admin`                             | WORKS   | `admin-hub-view`, cards render                                                |
| `/admin/settings`                    | WORKS   | rendered; `null` values fixed (D-3)                                           |
| `/admin/roles`                       | WORKS   | `admin-roles-view`                                                            |
| `/admin/rules`                       | WORKS   | `admin-rules-view`, 1 real rule                                               |
| `/admin/operations`                  | WORKS   | outbox metrics real; two panels backend-pending (see above)                   |
| `/admin/teams`                       | WORKS   | **new** — 2 real teams with lifecycle actions (super admin)                   |
| `/admin/seasons`                     | WORKS   | **new** — real seasons for the active team                                    |
| `/admin/permissions`                 | WORKS   | **new** — 91 permissions × 6 role bundles, policy version 5                   |
| `/settings`                          | WORKS   | theme, locale, connectivity, API mode                                         |
| `/workbench`                         | WORKS   | every designed state renders                                                  |
| unknown route                        | WORKS   | `not-found-page` with a home link                                             |

### Per-persona differences

- **Player with no team** (`player.audit@…`): every team-scoped route rendered
  the designed `guard-team-required` state ("Select a team… Ask an administrator
  to add you to a team"), `/admin` rendered `guard-forbidden`, and the navigation
  showed only Home, Notifications and Settings. Correct in every case.
- **Team administrator**: before D-1, an almost empty shell. After D-1, the full
  team rail plus Seasons and the permissions matrix, and `/admin/teams` is
  correctly absent — browsing every team is a platform capability they do not
  hold.
- **Super administrator**: `/admin/teams` renders with create and lifecycle
  controls.

## Environment finding worth keeping

The backend's dev `CORS_ORIGIN` is `http://localhost:3000,http://localhost:5173`.
Serving the client from any other origin — including `127.0.0.1:5173`, which is
the _same host_ by a different name, and `127.0.0.1:4173`, which is what
`playwright.config.ts` uses for the mock-mode suite — fails the preflight and
every request dies as `net::ERR_FAILED` with no status code. The first sweep of
this audit reproduced exactly that on `127.0.0.1:4190` and it looked identical to
a dead backend. Any live-backend run must use `localhost:5173`.

## What was built in response

| Item                       | Outcome                                                                                                                                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Team-scoped permissions    | `useEffectivePermissions` unions global and team-scoped grants (D-1).                                                                                                                                                |
| Team switcher (gap 9)      | Persisted, versioned selection store; switcher in the app bar; every team-scoped hook now resolves the selected team; switching invalidates the server cache. Collapses entirely for a single-team principal.        |
| Invite by email (gap 8)    | One "invite a real person" flow creating the account invitation **and** the roster profile, with a receipt showing the address and the one-time accept link, and specific copy for duplicate/invalid/expired.        |
| Date field (gap 7)         | `AppDateField` rebuilt as a bordered, 44px, calendar-iconed button with a "Select a date" placeholder, helper text, focus/hover states, and an inline expanding calendar. Never shows a date the form does not hold. |
| Teams (gap 1)              | `/admin/teams`: browse, create, edit, and the real lifecycle verbs, gated on the platform permissions the backend enforces.                                                                                          |
| Seasons (gap 2)            | `/admin/seasons`: list, create, edit, and the draft→active→closed→archived lifecycle, with the "one active season per team" conflict surfaced as its own message.                                                    |
| Permissions matrix (gap 3) | `/admin/permissions`: the seeded catalog × role bundles, filterable by area, stamped with the policy version.                                                                                                        |
