# Practice RSVP detail module

Who is coming to one practice session, the summary counts, and the one
member a coach overrode or is reading the history of.

## Public surface (`index.ts`)

| Export                                                          | Purpose                                |
| ----------------------------------------------------------------- | --------------------------------------- |
| `getPracticeRsvpDetailRouteDefinitions`, `practiceRsvpDetailPath` | `/practice-sessions/:sessionId/rsvps`  |
| `practiceRsvpDetailQueryKeys`                                     | Cache branch for one session's roster.  |
| `rsvpResponseSchema` and siblings                                  | Wire contracts, shared with MSW.        |
| `RsvpParticipant`, `RsvpSummary`, `RsvpRecord`, `RsvpRevision`    | Domain shapes.                          |
| `RSVP_SOURCE`, `RSVP_NOTE_VISIBILITY`                              | The two vocabularies this module owns.  |

`RsvpStatus` and `RsvpReason` are **not** re-exported here — they are
`@/modules/practice`'s. This module is the coach's view of the same answers a
member gives through `practice`, not a second vocabulary for them.

## Endpoints consumed

| Route                                | Used by                              |
| ------------------------------------- | -------------------------------------- |
| `GET .../rsvps`                       | The roster read.                      |
| `GET .../rsvps/summary`               | The privacy-safe planning counts.     |
| `PUT .../rsvps/{membershipId}`        | The override form.                    |
| `GET .../rsvps/{membershipId}/history`| The history panel.                    |

## Invariants

- **`practice.manage`, not `practice.read`.** A member may read the agenda of
  a session they attend; who is coming — and changing that on somebody's
  behalf — is a coach's action. The backend re-authorizes every call
  regardless.
- **An override is somebody's answer changed on their behalf.** The wire
  contract makes `reason` mandatory for exactly that reason, and the client
  confirms the write with `useConfirmAlert` before it ever fires — never
  optimistically, because the screen must not claim a change the server might
  still refuse.
- **History stays visible after the override runs.** It is the whole reason
  the endpoint exists: an override without a durable trail is indistinguishable
  from a coach silently overwriting someone's answer.
- **The roster's participant shape carries no display name.** `idLabel`
  therefore renders the membership id itself; inventing a name from another
  module's data would be guessing at a join the contract does not offer.
- **`status`/`reasonCategory` are `practice`'s `RSVP_STATUS`/`RSVP_REASON`.**
  Imported through its public surface, never redeclared, so a status a member
  can set and a status a coach can override are always the same vocabulary.
- **"Load more" widens the roster window rather than paging through it** —
  the same choice `practice`'s own calendar makes — so a roster a coach is
  mid-review of never shifts pages under them.
- **Route is `offline: false`.** An override is a write against a live
  record; an offline shell could only show a stale roster beside controls
  that cannot work.

## Related

- Rules: [03-components](../../../rules/03-components.md),
  [15-server-state-and-queries](../../../rules/15-server-state-and-queries.md),
  [17-error-handling](../../../rules/17-error-handling.md),
  [19-accessibility](../../../rules/19-accessibility.md).
- Sibling: [`practice-reminders`](../practice-reminders/README.md) — same
  session-scoped, coach-gated shape, notifications rather than the roster.
- Owner: [`practice`](../practice/README.md) — the session and the member's
  own RSVP; this module is the coach's view of everyone's.
