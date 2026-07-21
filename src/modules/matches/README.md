# Matches module

Live scoreboard with an offline scorekeeper (prompt 811) and derived match statistics with player
reports (prompt 812), built on the backend match lifecycle (503) and statistics projection (504).

## Public surface (`index.ts`)

| Export                       | Purpose                                                       |
| ---------------------------- | ------------------------------------------------------------- |
| `getMatchesRouteDefinitions` | Protected `/matches`, `/matches/:matchId`, `.../statistics`.  |
| `matchesPath` and siblings   | Typed concrete navigation targets.                            |
| `matchesQueryKeys`           | Team/match-scoped query keys.                                 |
| match + statistics schemas   | Runtime mirrors of the NestJS DTOs the endpoints return.      |
| `useScorekeeperQueueStore`   | The persisted offline queue, for lifecycle wiring and tests.  |
| match domain constants       | App-owned as-const vocabulary (status, outcome, queue state). |

## Flow and ownership

```text
route -> screen hook -> scoreboard/events/ruleset queries -> services -> gateway -> @/packages/http
                    -> scorekeeper controls -> record-action service -> persisted queue
                    -> replay service -> events gateway (operation id + expectedStreamVersion)
                    -> transition/finalize mutations
```

## The idempotency contract, honoured exactly

The backend keys every scoring command on a client-supplied `operationId` and answers with an
explicit `outcome`. The client is built around that contract rather than around optimism:

- **One id per action, minted once.** `queue-scorekeeper-operation.service.ts` generates the
  operation id at the moment of the tap. Every later delivery attempt reuses it, so a retry after a
  lost response is a server-side **replay** — the score moves once, not twice.
- **`applied` and `replayed` are both success.** The queued entry is dropped and the authoritative
  score comes from the response either way.
- **`conflict` is never merged.** The same id carrying a different payload (or a stale
  `expectedStreamVersion`) parks the operation in a `conflict` state and raises a conflict block
  showing the queued record beside the server's, with a discard or a reload. There is deliberately
  no merge affordance: merging two divergent scores would publish a number neither scorekeeper
  recorded. The local `payloadFingerprint` makes the divergence visible next to the id.
- **Base stream version travels with the command.** `expectedStreamVersion` is the version the
  operator was looking at, so a backlog replayed after someone else scored is rejected rather than
  applied on top of a stream it never saw.

## Offline queue rules

- Persisted through Preferences (`STORAGE_KEYS.scorekeeperQueue`), versioned, migrated, and
  re-validated on every rehydration, so an app restart mid-match replays exactly what the field
  recorded.
- **Owner-scoped.** Each entry carries the `ownerUserId` that recorded it and
  `selectOwnedMatchQueue` is the only read path, so a logout or account switch neither shows nor
  submits another scorekeeper's unsent points. A device still holding foreign work says so.
- **Bounded and blocking.** At `SCOREKEEPER_QUEUE_LIMIT` the enqueue is refused and scoring is
  disabled with recovery guidance. The oldest action is never evicted: a dropped point is a wrong
  final score.
- Replay runs in recorded order on reconnect; failures retry up to `SCOREKEEPER_MAX_RETRIES` and
  then park as `failed` for a manual retry.
- **Finalization is gated** on an empty queue, a scoreboard at least as new as the last observed
  stream version, and a completed match. The panel states which of the three is blocking.

## Undo

Undo appends a compensating `void` event carrying a written reason. The original point stays in the
stream, marked voided, with its reason attached. Nothing is rewritten or deleted, and undo is
blocked while anything is queued (correcting an event the server has not seen would void the wrong
sequence once the backlog lands).

## Zero-contribution completeness and null vs zero

The statistics table renders **every player the projection returns, including rostered players with
an all-zero line**, which carry an explicit "no recorded contribution" note. A measured zero prints
`0`; a measure the event stream cannot support arrives as `null` and prints "not enough data". The
two are never collapsed, in the schema, the mapper, or the view model. The derivation panel reports
whether lineups and plays were recorded so the reader knows why a measure is missing.

## Backend gap: video analysis

The backend does not expose clip, timestamp, or tag endpoints yet (prompt 505 is unshipped). The
video surface renders a clearly marked "not available yet" panel — no mock data, no fake route, no
handler. Recorded in [`docs/api-verification.md`](../../../docs/api-verification.md).

## Access and accessibility

- `/matches` and the scoreboard require `match.read`; scoring controls additionally require
  `match.score`, finalization `match.finalize`, and statistics `match.stats.read`. The backend
  re-authorizes every read and every write.
- Scoring targets are full-width and at least 72px tall, well past the 44px minimum, with a haptic
  on each tap. The score pair is `aria-hidden` and a single polite live region carries the spoken
  form. The chart ships an accessible table alternative. English/Arabic, RTL-safe logical
  properties, and dark/light tokens throughout.

## Tests

- Unit tests cover schemas, mappers, queue store/selectors/migrations, replay outcomes, the
  finalize guard, every view helper, components, routes, and the translated view models.
- Integration and contract suites exercise the exact MSW wire with the same Zod schemas, including
  retried operations, same-id/different-payload conflicts, restart persistence, cross-user
  isolation, queue-at-limit blocking, and finalize gating.
- Playwright covers the scoreboard, offline scoring, the statistics table's zero rows,
  accessibility, and visual baselines.
