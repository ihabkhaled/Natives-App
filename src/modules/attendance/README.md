# Attendance module

Coach/admin attendance for one practice session (prompt 805): bounded roster loading, bulk marking,
late/excused exceptions, finalization, audited corrections, and a conflict-visible offline queue.
The module also owns the member self surface `/my-attendance` (prompt 240): the own participation
summary and the per-session self check-in, reading exclusively self-scoped endpoints.

## Public surface (`index.ts`)

| Export                                   | Purpose                                                     |
| ---------------------------------------- | ----------------------------------------------------------- |
| `getAttendanceRouteDefinitions`          | Coach capture route + member `/my-attendance` route.        |
| `attendancePath` / `myAttendancePath`    | Typed concrete navigation targets.                          |
| `attendanceQueryKeys`                    | Team/session-scoped query keys.                             |
| attendance response schemas              | Exact runtime mirrors of the committed NestJS OpenAPI DTOs. |
| attendance status/excuse/sheet constants | App-owned as-const domain vocabulary.                       |

## Flow and ownership

```text
route -> screen hook -> sheet/history queries -> services -> gateway -> @/packages/http
                    -> mutation hooks -> bulk/finalize/correction services
                    -> persisted queue -> replay service -> record-one gateway
```

- The roster query is bounded to 100 entries, the backend contract maximum.
- Online bulk writes use the atomic bulk endpoint. Offline writes become one local operation per
  player so replay can expose player-level success, retry, and conflict state.
- Each queued operation has a local operation ID, last-seen record version, retry count, and
  explicit pending/retrying/conflict/failed state. The queue holds at most 50 operations.
- `expectedVersion` protects replay from silently overwriting a newer attendance record. A conflict
  remains visible until the coach discards the stale operation, reviews the authoritative refetch,
  and submits again.
- Finalization is disabled while drafts, queued writes, conflicts, or unmarked players remain.
  Finalized sheets accept only corrections carrying a non-empty reason; history is read from the
  audited backend endpoint.

## Member self surface (`/my-attendance`)

- Route: nav Team group order 12, gated on `attendance.read.self` (Analyst and Scorekeeper hold no
  self grant, so the entry never renders for them and the guard blocks their direct URL).
- Reads ONLY self endpoints: `…/attendance/me`, `…/attendance/check-in`,
  `…/attendance/me/participation`, and `…/attendance/me/history`. The roster is never fetched
  here — pinned by integration tests with counting handlers.
- Check-in window (contract 1.6.0): the server's `selfCheckIn.state`
  (`not_open | open | closed | locked | recorded`) is the single source of truth — the client
  renders it verbatim and never re-derives the window from its own clock. A 409
  (`errors.practices.checkInWindowClosed` / `attendanceLocked`) refetches the own record and shows
  the mapped copy, never a raw error. Repeat check-ins are server-idempotent: the existing record
  returns unchanged.
- Offline policy: a check-in is NOT queued offline — the window cannot be proven client-side, so
  the button disables with honest copy instead of recording a mark the server may refuse.
- Self history: `…/attendance/me/history` is newest-first and bounded — the window grows one page
  (20) per "load more" press and hard-stops at the contract's 100-item limit. `status: null` rows
  render "Not recorded"; open-sheet rows carry a "not finalized yet" hint.
- Participation copy cites the rule version, flags `ruleStatus: 'candidate'` as provisional, and
  renders the backend's `attendanceRuleMissing` answer as calm "not configured yet" copy — never a
  retry loop.

## Privacy and contract limits

- The Preferences queue contains only approved status, lateness, excuse category, IDs, and version.
  Private notes and evidence are never persisted, logged, or rendered.
- Roster rows carry the server-resolved `displayName` (null = no member profile, and only then the
  deterministic positional label stands in) and `rsvpStatus`, rendered as a chip per status — the
  client never invents remote data.
- The committed write contract has no operation-ID request field or idempotency header. The client
  deduplicates its local queue and sends `expectedVersion`, but a first write whose response is lost
  cannot be proven server-idempotent until the backend publishes such a contract.

## Access and accessibility

- Coach capture visibility requires `attendance.record` and team context; the finalize action also
  requires `attendance.finalize` and the audited correction editor `attendance.correct` — a Coach
  (whose bundle lacks correct) sees a locked sheet read-only instead of an action that would 403.
  Discoverability is the session-detail CTA plus the Home widget deep link; the session-scoped
  route itself stays out of the nav. The backend remains authoritative for authentication,
  permission, active membership, and team/session ownership.
- Controls have translated English/Arabic labels, 44px targets, keyboard-native checkboxes, live
  busy/error state, responsive tablet/mobile layout, dark-theme tokens, and logical RTL alignment.
- Historical snapshot rows remain in DOM order even when `userId` is null.

## Tests

- Unit tests cover schemas, mapping, queue migration/bounds/replay, query/mutation behavior, editor
  undo and exceptions, components, routes, and translated view models.
- Contract and integration suites exercise the exact MSW wire and real HTTP client.
- Playwright covers coach bulk marking, offline queue/replay/conflict, finalization/correction,
  keyboard selection, mobile layout, and authorization; axe scans the screen.
