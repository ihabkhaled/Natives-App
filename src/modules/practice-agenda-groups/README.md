# Practice agenda groups module

Splitting a session's roster into working groups, assigning members to them,
seeing the plan those groups resolve to, and copying a whole agenda from
another session instead of rebuilding it block by block.

## Why a new module, not an extension of `practice-agenda`

`practice-agenda` already owns the session's plan read (`GET .../agenda`) and
its own `agendaResponseSchema` deliberately does not declare `groups`:

> "The agenda's `groups` array is deliberately not declared. Group assignment
> is a separate endpoint family this module does not consume, and the parser
> drops what it does not declare — modelling it would be dead weight."

That line in `practice-agenda`'s own schema is the design decision already
made for this work: group assignment (`/agenda/groups...`) is its own
endpoint family, and `/agenda/plan` and `/agenda/copy` sit with it rather than
with the plain agenda read, because both exist to serve group planning — the
plan endpoint is documented as "the coach plan (includes private coach
notes)", a materially different read from `practice-agenda`'s "no private
coach notes" version, and copying an agenda is meaningless without somewhere
to land the groups it may carry.

Extending `practice-agenda` instead would have meant either declaring
`groups` in a schema whose owning module's whole point is not consuming it, or
smuggling a second concern into a module whose one job is the plan. A sibling
module — alongside `practice`, `practice-agenda` and `practice-reminders`,
all scoped to the same session — keeps each endpoint family owned by the
module that actually uses it.

## What is reused rather than restated

`agendaGroupsPlanResponseSchema` is `practice-agenda`'s own
`agendaResponseSchema.extend({ groups: ... })` — every block and station
field is declared exactly once, in `practice-agenda`, and this module adds
only the one field that module leaves out. The two agenda reads cannot drift
apart because there is only one schema for everything they share.
`AgendaSummary` (the header `POST .../agenda/copy` answers with) is
`practice-agenda`'s own type and schema, unmodified — the copy answer has the
identical shape as a reorder's.

## Public surface (`index.ts`)

| Export                                           | Purpose                                       |
| ------------------------------------------------ | --------------------------------------------- |
| `getPracticeAgendaGroupsRouteDefinitions`        | `/practice-sessions/:sessionId/agenda/groups` |
| `practiceAgendaGroupsQueryKeys`                  | Cache branch for one session's plan.          |
| `agendaGroupsPlanResponseSchema` and siblings    | Wire contracts, shared with MSW.              |
| `AgendaGroup`, `AgendaGroupsPlan`, `GroupMember` | Domain shapes.                                |

## Endpoints consumed

| Route                                                | Used by                            |
| ---------------------------------------------------- | ---------------------------------- |
| `GET .../agenda/plan`                                | The screen's read.                 |
| `POST .../agenda/copy`                               | "Copy plan" — replaces the agenda. |
| `POST .../agenda/groups`                             | "Create group".                    |
| `DELETE .../agenda/groups/{groupId}`                 | "Remove group" (confirmed).        |
| `POST .../agenda/groups/{groupId}/members`           | "Add" one membership at a time.    |
| `DELETE .../groups/{groupId}/members/{membershipId}` | "Remove" (confirmed).              |

## Invariants

- **`practice.manage` alone, not a read/manage split.** `practice-agenda`
  gates its read on `practice.read` because a member attending the session
  may reasonably see the published plan. This module's read is the _coach's_
  plan — documented as carrying private coach notes — and splitting the
  roster into groups is the same kind of roster decision `practice-reminders`
  gates on `practice.manage`: a member has no more reason to see it than they
  do who has not RSVPed.
- **Every write invalidates the one query key.** No mutation trusts its own
  response body to update the screen; each one invalidates
  `practiceAgendaGroupsQueryKeys.plan(teamId, sessionId)` and the re-read is
  what the coach sees next. This includes member removal, whose 200 response
  carries the updated group — discarded on purpose, the same way
  `practice-agenda`'s station removal discards its 204: `HttpClient.delete`
  never parses a body, and re-reading is one behaviour to reason about instead
  of two.
- **Removing a group or a member is confirmed, once, before it fires.**
  `useConfirmAlert` gates `onRemoveGroup` and `onRemoveMember` in
  `use-agenda-groups-actions.hook.ts`. Creating a group and adding a member
  are not confirmed — either is undone by the same removal this hook already
  guards.
- **The resolved plan is read-only.** Blocks and stations render from the
  same plan this screen reads, each station's `groupId` turned into the
  group's name — but there is no control to edit a block or a station here.
  That command belongs to `practice-agenda`, which already owns it; rebuilding
  it a second time in this module would only create two places a block can be
  changed from.
- **One coarse "busy" flag, not per-row state.** While any group command is
  in flight, every group's controls disable together rather than tracking
  which row is mid-request. A coach acts on one group at a time in practice,
  and per-row busy tracking would have doubled the state this module carries
  for a case that does not arise.

## Not built, and why

**No roster picker for "assign members."** `AssignGroupMembersDto` takes
`membershipIds`, but no endpoint this module (or `practice-agenda`, or
`practice`) is scoped to exposes a session roster with names attached that
this module's public surface can reach — `practice`'s own RSVP list is not
exported, and reaching into `attendance`'s roster query would mean pulling in
a whole other module's permission story for a field this module does not
otherwise need. The add-member control takes one membership id as typed text
instead of a name from a list. This is the same restraint `practice-agenda`'s
README documents for the RSVP override it left out: a real picker needs data
this module was not given, and faking one with a text field pretending to be
a picker would have been worse than naming the limitation.

**No colour picker.** `CreateGroupDto.color` accepts any string up to 32
characters, but a coach choosing from six named swatches gets a group they
can tell apart at a glance, and a hex or CSS-colour text field would not buy
anything a coach actually needs. `AGENDA_GROUP_COLOR_SWATCHES` is the fixed
list; the empty option sends no colour at all.

## Shape

`gateways/` speaks the wire, one `request*` per endpoint. `services/` is one
use case per file. `queries/` owns the plan read; `mutations/` own the five
writes, each invalidating the same query key. `hooks/use-agenda-groups-forms`
owns every field's rest state (the new-group form, the copy-source field, and
one add-member value per group, keyed by group id so typing into one group's
field cannot clear another's). `hooks/use-agenda-groups-actions` owns the
mutations, the confirm-then-run guard on both removals, and the one notice
line every command reports through. `hooks/use-practice-agenda-groups-screen`
composes both into the view. Components are presentational; the resolved plan
and the group list are read from the same `AgendaGroupsPlan`, so
`helpers/resolved-plan-blocks.helper.ts` and the group-row builder in
`helpers/agenda-groups-view.helper.ts` are the only two places a station's
`groupId` is turned into a name.

## Related

- Rules: [03-components](../../../rules/03-components.md),
  [15-server-state-and-queries](../../../rules/15-server-state-and-queries.md),
  [17-error-handling](../../../rules/17-error-handling.md),
  [19-accessibility](../../../rules/19-accessibility.md).
- Siblings: [`practice-agenda`](../practice-agenda/README.md) — the plan read
  and its own block/station commands; [`practice-reminders`](../practice-reminders/README.md)
  — the same `practice.manage`-only pattern, one session's roster decisions.
