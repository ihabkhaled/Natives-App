# Practice reminders module

Who still has to hear about a practice session, and what sending would actually do.

## Public surface (`index.ts`)

| Export                                                           | Purpose                                   |
| ---------------------------------------------------------------- | ----------------------------------------- |
| `getPracticeRemindersRouteDefinitions`, `practiceRemindersPath`  | `/practice-sessions/:sessionId/reminders` |
| `practiceRemindersQueryKeys`                                     | Cache branch for one session's status.    |
| `reminderStatusResponseSchema` and siblings                      | Wire contracts, shared with MSW.          |
| `ReminderStatus`, `ReminderDispatchResult`, `ReminderTestResult` | Domain shapes.                            |

## Endpoints consumed

| Route                         | Used by                                  |
| ----------------------------- | ---------------------------------------- |
| `GET .../reminders/status`    | The screen's read.                       |
| `GET .../reminders/preview`   | Gateway only — the dispatcher's dry run. |
| `POST .../reminders/dispatch` | "Send due reminders".                    |
| `POST .../reminders/test`     | "Send a test to myself".                 |

## Invariants

- **`practice.manage`, not `practice.read`.** A member may read the agenda of a
  session they attend; who has not replied is roster information and mailing
  them is a coach's action. The backend re-authorizes every call regardless.
- **A self-test is addressed by the server, from the token.** There is no
  recipient parameter, so it cannot be aimed at the roster by mistake.
- **`candidates` and `enqueued` are both reported.** They differ whenever a
  recipient was suppressed — quiet hours, preference, or already sent — and
  showing only one would tell a coach the roster was reached when it was not.
- **Nothing is optimistic.** "Sent" is never rendered for a message the queue
  refused.
- **A quiet-hours refusal is an outcome, not an error.** It is the member's own
  preference being honoured, and the copy says so.
- **The send disables itself when it cannot accomplish anything** — past
  session, closed window with no override, or nothing due. An enabled button
  that can only answer "nothing was due" reads as a failure the coach caused.
- **Route is `offline: false`.** Sending is a write against a live queue; an
  offline shell could only show a stale count beside a button that cannot work.

## The reminder window

`resolveReminderWindowKey` resolves in the order that decides it: a finished
session first (the cutoff is then irrelevant), then an open window, then the
`urgentCancellationOverride` — which only means something once the cutoff has
passed. A late cancellation reopens a closed window; it does not reopen an open
one.

## Related

- Rules: [03-components](../../../rules/03-components.md),
  [15-server-state-and-queries](../../../rules/15-server-state-and-queries.md),
  [17-error-handling](../../../rules/17-error-handling.md),
  [19-accessibility](../../../rules/19-accessibility.md).
- Sibling: [`practice-agenda`](../practice-agenda/README.md) — same session, the
  plan rather than the notifications.
