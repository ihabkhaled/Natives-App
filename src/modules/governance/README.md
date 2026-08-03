# Governance module

The board's own record: the meetings it holds and the tasks those meetings raise. Remote and mock
modes consume the backend's team-scoped **governance** contract exactly.

Owner persona: whoever holds `governance.read`. The grant opens the screen; it does not decide what
appears on it — the server filters every record by its own visibility, so two people with the same
grant can legitimately see different meetings.

## The rules that shape everything here

**Visibility is the server's answer, and the screen still shows it.** The list already excludes what
the caller may not read, so nothing here re-checks permissions per record. Each meeting is
nevertheless labelled with who it is visible to, because a board member about to quote a decision
needs to know whether it is public, staff-only or board-only before they repeat it.

**Minutes are settled by approval, not by status.** A meeting can sit at `minuted` while its minutes
still await sign-off, so the card reads `minutesApprovedAt` rather than `status`. A decision is
quotable once the minutes are approved and not before — deriving that line from the status would
have called an unapproved record final.

**Open work comes before closed work.** Tasks sort closed-last, then by priority within each group,
so a completed urgent task never outranks an open one. A blocked task says it is waiting on another
task, so the board chases the dependency instead of the owner.

**Both lists must arrive before the screen claims to be ready.** The page promises meetings AND
tasks; reporting `ready` when one request failed would hide the failure behind the half that
worked, and a board member would read an incomplete record as a complete one.

## Shape

`gateways/` speaks the wire, one `request*` per endpoint. `services/` is one use case per file.
`queries/` owns the cache keys. `helpers/governance-view.helper.ts` holds every ordering and
labelling decision as pure functions, which is why they are the most heavily tested part of the
module. `hooks/use-governance-screen.hook.ts` is the view model; components are presentational and
receive prepared props.

## Not built yet

Read-only. `POST /governance/meetings` and `POST /governance/tasks` exist in the contract and are
deliberately not wired: creating a meeting needs copy for a scheduling form, a visibility choice and
a recurrence choice, and inventing those labels would ship untranslatable UI against a locale gate
that enforces en/ar parity.

Paging stops at the first page — `GOVERNANCE_PAGE_SIZE` bounds each read and the screen does not yet
advance past it. `POST /governance/positions/{positionId}/appointment` is untouched; appointments are
a separate concern from meetings and tasks.
