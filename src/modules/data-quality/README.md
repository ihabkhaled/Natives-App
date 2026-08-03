# Data quality module

The operations queue for the anomalies the backend's nightly rules detect: review one, see what a
repair would change, then apply it. Remote and mock modes consume the backend's team-scoped
**data-quality** contract exactly.

Owner persona: whoever holds `data_quality.manage`. There is no read-only variant to model —
reviewing and repairing are the same grant — so the route is gated on it and the screen shows its
designed forbidden state to anyone else.

## The rules that shape everything here

**Nothing is repaired without the operator seeing the impact first.** The preview is a `GET`, so
opening it changes nothing; only apply writes. `repair-preview` reports the impact count and
whether the change is reversible, and the screen repeats that verdict verbatim — an operator is
never told a change can be taken back when the server says it cannot.

**A closed finding stays closed.** Once an anomaly is `resolved` or `suppressed`, the card offers
reopen and nothing else. Repairing something an operator has already judged would undo their
decision without telling them, so the affordance is absent rather than disabled.

**Optimistic concurrency is the operator's protection, not a formality.** Every transition sends
the anomaly's `recordVersion`. Two people triaging the same queue is the normal case, and the
server refusing a stale move is how the second one learns the first got there — silently
overwriting would lose a judgement call.

**The queue orders itself; the client does not invent priority.** Cards sort by severity worst
first, then by most recently seen, so a recurring problem rises above a one-off of equal severity.
`ruleKey` and `resourceRef` are server-authored strings rendered verbatim — a rule added on the
server needs no client release.

**A failed action says so plainly.** Every command resolves to one sentence rather than a raw
server message: an operator needs to know the action did not happen, not how the database phrased
it.

## Shape

`gateways/` speaks the wire, one `request*` per endpoint. `services/` is one use case per file.
`queries/` and `mutations/` own the cache; the mutations invalidate the team branch so the queue
re-reads after any write. `hooks/use-data-quality-screen.hook.ts` is the view model, delegating
commands to `use-data-quality-actions.hook.ts` and the preview flow to `use-repair-preview.hook.ts`.
Components are presentational and receive prepared props.

## Not built yet

Repair rollback has a gateway and a service but no affordance: the screen applies repairs and does
not yet offer the undo the preview promises. Paging is fixed to the first page — `ANOMALY_PAGE_SIZE`
bounds the read, and the queue does not yet advance past it.
