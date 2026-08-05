# Practice schedules module

The recurring pattern a team practises on — define it, edit it, retire it,
and turn it into real sessions.

## Public surface (`index.ts`)

| Export                                                                | Purpose                                                    |
| ---------------------------------------------------------------------- | ----------------------------------------------------------- |
| `getPracticeSchedulesRouteDefinitions`, `practiceSchedulesPath`, `practiceScheduleNewPath`, `practiceScheduleDetailPath`/`Pattern` | `/practice-schedules` (list) and `/practice-schedules/:scheduleId` (detail/edit). |
| `practiceSchedulesQueryKeys`                                          | Cache branch for one team's schedules.                     |
| `scheduleResponseSchema` and siblings                                  | Wire contracts, shared with MSW.                            |
| `PracticeSchedule`, `PracticeScheduleListPage`, `GenerationResult`     | Domain shapes.                                               |
| `PracticeSchedulesListScreenView`, `PracticeScheduleDetailScreenView` | View shapes, consumed by test factories.                    |

## Endpoints consumed

| Route                                              | Used by                              |
| --------------------------------------------------- | ------------------------------------- |
| `GET .../practice-schedules`                       | The list screen.                     |
| `POST .../practice-schedules`                      | Create, from the blank `/new` form.  |
| `GET .../practice-schedules/{id}`                  | The detail/edit screen's read.       |
| `PATCH .../practice-schedules/{id}`                | Save an edit.                        |
| `DELETE .../practice-schedules/{id}`                | "Delete" (the server archives it).   |
| `POST .../practice-schedules/{id}/generate`        | "Generate sessions".                 |

## Invariants

- **`practice.manage`, not `practice.read`.** Defining the pattern behind a
  session is a coach's configuration, not something a member reads. The
  backend re-authorizes every call regardless.
- **The create route is a literal path, not a shorter pattern.**
  `/practice-schedules/new` is declared ahead of `/practice-schedules/:scheduleId`
  in the route table, the same way `/news/manage` precedes `/news/:slug` —
  otherwise "new" would match the pattern with `scheduleId = "new"`.
- **`PATCH` is a full replace, guarded by `expectedVersion`.**
  `UpdateScheduleDto` requires the whole record back, not a sparse diff, so a
  save that only touched one field still carries every field the schema
  needs — including the fields the form does not show, round-tripped
  unchanged from the record that was loaded (see `toCarryOverFields`).
- **`DELETE` archives; it does not erase.** The endpoint's summary is "Archive
  a practice schedule" and returns the archived record. There is no
  "reactivate" flow in this client — `SCHEDULE_STATUS` only ever writes
  `active`.
- **Generate always says something.** `created` and `skipped` are both
  reported; a run that made nothing new still states that explicitly —
  never a screen that looks like the button silently did nothing. Generation
  is confirmed with `useConfirmAlert` before it runs, because it creates real
  sessions.
- **Generate invalidates the practice module's cache, not this module's.**
  A successful run creates rows the calendar owns; nothing about the
  schedule record itself changes. The invalidation goes through
  `practiceQueryKeys`, the practice module's own public export — never a
  duplicated key.
- **`sessions` in the generation result is still schema-validated,** through
  the practice module's own `practiceSessionResponseSchema` — never a second
  copy of that shape — even though the screen only ever surfaces the two
  counts.
- **Every route is `offline: false`.** Every screen here reads or writes a
  live pattern; an offline shell could only show a stale copy beside
  controls that cannot work.

## Related

- Rules: [03-components](../../../rules/03-components.md),
  [15-server-state-and-queries](../../../rules/15-server-state-and-queries.md),
  [16-forms-and-validation](../../../rules/16-forms-and-validation.md),
  [17-error-handling](../../../rules/17-error-handling.md),
  [19-accessibility](../../../rules/19-accessibility.md).
- Sibling: [`practice`](../practice/README.md) — owns the sessions this
  module's `generate` action creates.
- Sibling: [`practice-reminders`](../practice-reminders/README.md) — same
  `practice.manage` grant, same session-adjacent shape.
