# Practice agenda module

The coach's plan for one practice session: the blocks the session runs through, in order, and the
stations inside each one. Session-scoped — the route carries `:sessionId` and the screen means
nothing without it. Remote and mock modes consume the backend's **practice-agenda** contract
exactly.

Two personas, two grants. `practice.read` opens the screen, because a member attending a session
may legitimately read the plan for it. `practice.manage` is what turns the plan into an editor, so
a reader sees the same blocks and stations with none of the controls that would change them.

## The rules that shape everything here

**A move is immediate on screen and provisional everywhere else.** A coach adjusting a session that
is already running cannot wait a round trip to see what they just did, so the reorder redraws at
once. It is never the last word: the whole block-id list posts with `expectedVersion`, and the
provisional order is given up in both directions — an accepted move bumps the version, so the
re-read plan replaces what the coach drew, and a refused one clears it outright so they see the
order that actually holds rather than the one they wanted. `helpers/agenda-order.helper.ts` is that
rule, pure and on its own; `hooks/use-agenda-block-order.hook.ts` is the state around it.

**The arrows go quiet while a move is in flight.** A second move would carry the version the first
one is about to spend, so the server would refuse it and the coach would watch their own change roll
back. Waiting one round trip is the honest alternative to manufacturing a conflict.

**The server orders the plan; the client does not invent an order.** `position` is the field of
record, and the wire is sorted by it rather than trusted to arrive sorted. A block the coach's
pending order never mentioned — one another coach added mid-rearrangement — is kept rather than
dropped: the plan on screen must not lose a block the session will still run.

**The coach's words are rendered, not translated.** A block's `title` and `notes`, and a station's
`name` and `target`, are coach-authored content, not backend copy, so they appear verbatim. Only the
chrome around them goes through i18n. This is the opposite of `src/modules/practice`, whose agenda
preview models a `labelKey` — see below.

**Untimed is not zero.** `durationMinutes: null` produces no duration chip at all. The backend
distinguishes a block nobody has timed from a zero-length one, and so does the plan.

**A failed action says so plainly, once.** Every command resolves to one sentence in a live region
rather than a raw server message. The notice lives in `use-practice-agenda-actions.hook.ts` and is
lent to the reorder hook so the two commands share one line instead of opening two.

## Shape

`gateways/` speaks the wire, one `request*` per endpoint. `services/` is one use case per file.
`queries/` owns the read; `mutations/` own the writes and invalidate this session's branch — which
is what makes the optimistic order reconcile. `hooks/use-practice-agenda-screen.hook.ts` is the view
model, delegating provisional order to `use-agenda-block-order.hook.ts` and the station command plus
the shared notice to `use-practice-agenda-actions.hook.ts`.
`hooks/use-practice-agenda-route-screen.hook.ts` binds the routed `:sessionId`. Components are
presentational; block reordering renders through the shared `ReorderableRows` primitive rather than
a drag dependency, so it is keyboard-first and reads identically in RTL.

## Relationship to `src/modules/practice`

`practice` owns sessions and the calendar and is not edited by this module. Its
`PracticeAgendaItem` (`{ id, labelKey, durationMinutes }`) is **not** this module's block: it is a
placeholder on the session-detail view model that the session mapper hard-codes to `[]`, because the
session-detail DTO carries no agenda. Nothing in `practice` consumes `GET .../agenda`. So the block
and station domain here is modelled fresh from `AgendaResponseDto` rather than built on that shape —
reusing a three-field placeholder keyed by i18n would have thrown away everything the real contract
carries and mistranslated coach-authored titles into lookup keys.

What is reused rather than restated: `I18N_KEYS.practice.agendaDuration` for the duration chip, and
`I18N_KEYS.settingEditors.{moveUp,moveDown,remove}` for the shared reorder primitive's own controls.

## Contract notes

The endpoint list this module was commissioned from differs from `contracts/openapi.json` in three
places, and the contract won:

- There is **no** `GET .../blocks/{blockId}/stations`. Stations arrive nested inside
  `AgendaResponseDto.blocks[].stations`, so the plan is one read.
- There is **no** `PATCH .../stations/{stationId}`. A station can be added or removed, not edited.
- The RSVP writes are `PUT`, not `POST`/`PATCH`, and there is no `POST .../rsvps` at all.

`AgendaResponseDto.groups` is deliberately not declared in the schema: group assignment is a
separate endpoint family (`/agenda/groups`) outside this module's scope, and the parser drops what
it does not declare.

## Not built yet

**Adding a station** (`POST .../blocks/{blockId}/stations`) has no affordance. The station's `name`
is required, so the control is a form, and this module holds no copy for a name field, its
validation, or a submit action. The gateway and service were left out rather than shipped dead.

**The RSVP half** (`GET .../rsvps`, `PUT .../rsvps/{membershipId}`) is not built. An override is a
form too — `OverrideRsvpDto` requires both a `status` and a free-text `reason` — and the design
intent is that it must name whose intent was overridden and say that it _was_ overridden rather than
silently replacing it. None of that copy exists in this module's key set, and there is no
`practice.rsvp.override` permission to gate it on (only `practice.rsvp.self`, which is the member's
own response and already lives in `src/modules/practice`). Borrowing `squads.override*` copy into a
practice screen would have been faking it.

**Block create, edit, delete and completion** are outside the commissioned endpoint set. Block rows
therefore expose no remove control, and `completionStatus` / `intensity` / `offsetMinutes` are
parsed but not rendered — each would need a label this module does not have.

**Row-specific control labels.** `ReorderableRows` is designed for labels like "Move Warm-up up" so
a screen-reader user knows which row a control acts on. The generic "Move up" / "Move down" is used
instead, because the only available copy has no `{{title}}` placeholder.
