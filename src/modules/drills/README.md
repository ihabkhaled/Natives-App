# Drills module

The team's reusable drill library: a coach browses and searches it, writes a
new drill, edits one, and retires one that is no longer run.

## Public surface (`index.ts`)

| Export                                                                                   | Purpose                                        |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `getDrillsRouteDefinitions`, `drillsPath`, `drillDetailPath`                             | `/drills` and `/drills/:drillId`.              |
| `drillsQueryKeys`                                                                        | Cache branch for one team's catalogue.         |
| `drillResponseSchema`, `listDrillsResponseSchema`                                        | Wire contracts, shared with MSW.               |
| `Drill`, `DrillsPage`, `CreateDrillCommand`, `UpdateDrillCommand`, `ArchiveDrillCommand` | Domain shapes.                                 |
| `DRILL_CATEGORIES`, `DRILL_INTENSITIES`, `DRILL_STATUSES`, `DRILL_NEW_ID`                | Vocabulary and the create-mode route sentinel. |

## Endpoints consumed

| Route                                           | Used by                                    |
| ----------------------------------------------- | ------------------------------------------ |
| `GET /teams/{teamId}/drills`                    | The list screen's read (one bounded page). |
| `POST /teams/{teamId}/drills`                   | "New drill" on the detail screen.          |
| `GET /teams/{teamId}/drills/{drillId}`          | The detail screen's read.                  |
| `PATCH /teams/{teamId}/drills/{drillId}`        | "Save drill" on an existing drill.         |
| `POST /teams/{teamId}/drills/{drillId}/archive` | "Archive drill".                           |

## Invariants

- **`drill.manage`, not a separate read grant.** The backend publishes no
  `drill.read` in its permission catalog, so both screens — browsing and
  writing — gate on the one grant a coach holds. The backend re-authorizes
  every call regardless.
- **Archive is a retirement, never a delete.** The endpoint flips `status` to
  `archived`; the record and its id survive so a past agenda station that
  references it keeps resolving. Every string this module renders for that
  transition says "archive" or "archived" — never "delete" or "remove" — and
  an archived drill still appears in the list and stays reachable on its own
  detail screen with a plain notice explaining why the archive control is
  gone.
- **One route serves list, and one serves create, view and edit.** The
  `:drillId` pattern accepts the `DRILL_NEW_ID` sentinel (`"new"`), which
  renders a blank form and skips the read. That is the entire mechanism that
  keeps this module at exactly the two screens the brief calls for.
- **The list has no server-side free-text search.** `GET .../drills` accepts
  `category`, `status`, `skillTag`, `limit` and `offset`, but no `q`
  parameter. The screen fetches one bounded page (`DRILLS_PAGE_PARAMS`,
  never unbounded) and narrows it client-side by name, objective and skill
  tags, alongside the category/status dropdowns.
- **A write command never sends `null` for a blank optional field.**
  `CreateDrillDto`/`UpdateDrillDto` mark `objective`, `instructions`,
  `safetyNotes`, `mediaUrl` and `defaultDurationMinutes` optional but NOT
  nullable — sending `null` is a validation error. `mappers/drills.mapper.ts`
  collapses "blank" to an omitted key, once, so every write path shares the
  same rule.
- **`expectedVersion` guards every edit.** A stale save answers `409
CONFLICT`; the screen reloads the latest record and tells the coach to
  redo the edit rather than silently overwriting someone else's change.
- **`seasonId` has no form field.** The wire contract offers no way to change
  it after creation, and a bare UUID picker for it is out of this module's
  scope; every drill created here is team-level.

## Related

- Rules: [03-components](../../../rules/03-components.md),
  [15-server-state-and-queries](../../../rules/15-server-state-and-queries.md),
  [17-error-handling](../../../rules/17-error-handling.md),
  [19-accessibility](../../../rules/19-accessibility.md).
- Sibling: [`practice-agenda`](../practice-agenda/README.md) — an agenda
  station references a drill by id only; this module owns no shared type
  with it.
