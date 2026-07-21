# Teams module

Owns the platform's team and season lifecycle surfaces, plus the read-only
role x permission matrix.

## Screens

| Route                | Screen             | Gate                         |
| -------------------- | ------------------ | ---------------------------- |
| `/admin/teams`       | Teams              | `team.browse.all` (platform) |
| `/admin/seasons`     | Seasons            | `team.read` + team context   |
| `/admin/permissions` | Permissions matrix | `member.roles.manage`        |

## Scope rules that are easy to get wrong

- **`/teams` is a PLATFORM route.** With no `:teamId` in the path there is
  nothing for a team-scoped grant to attach to, so only a global grant satisfies
  it. A team administrator gets 403 on browse-all and create by design — the
  screens gate on `team.browse.all` / `team.create` so the shell and the API
  agree. `/teams/mine` is the team-scoped read every member may perform.
- **Lifecycle moves are verbs, not status writes.** `POST …/activate`,
  `…/deactivate`, `…/archive`, `…/remove` for teams; `…/activate`, `…/close`,
  `…/archive` for seasons. Each carries `expectedVersion`. The row only offers
  the moves that are legal from its current state
  (`TEAM_TRANSITIONS_BY_STATUS`), because the server refuses the rest with
  `errors.teams.teamInvalidTransition`.
- **Exactly one active season per team** is a database invariant. Activating a
  second returns 409 `errors.teams.seasonAlreadyActive`; the screen states that
  reason rather than retrying.
- **`remove` is reachable only from `archived`.** It is not offered anywhere
  else.

## Layout

- `gateways/` — one file, every teams/seasons/rbac request, schema-parsed.
- `services/` — one use case per file (`architecture/one-service-use-case-per-file`).
- `hooks/` — workspace hooks per screen, plus the shared
  `use-lifecycle-transition` (confirm → run → report the server's real reason).
- `helpers/` — pure row/copy/validation builders; 100% covered.
