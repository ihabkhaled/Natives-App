# Attendance offline queue and conflict recovery

## What is stored

The attendance module persists a bounded queue through the platform Preferences adapter. Each
operation contains a generated local ID, team/session/membership IDs, approved attendance status,
lateness, excuse category, last-seen version, retry count, state, and UTC creation instant.

The queue never stores private excuse notes, evidence references, contact details, or backend error
messages. It accepts at most 50 operations and replaces an older pending operation for the same
team/session/member when the coach deliberately changes that row again.

## Replay state machine

```text
pending -> retrying -> removed (server accepted)
                    -> conflict (HTTP 409; manual review)
                    -> pending (transient failure, fewer than 3 attempts)
                    -> failed (3 attempts; manual retry)
```

Reconnect triggers sequential player-level replay. Successful rows disappear from the queue and
the authoritative sheet refetches. A conflict is never retried automatically: the coach chooses
“Use latest server version,” which discards the stale local operation and refetches before a new
edit. Finalization stays disabled while any queue item exists.

## Restart and privacy verification

The persisted payload is versioned and schema-validated on every rehydration. Corrupt, oversized,
or future-version payloads degrade to an empty queue instead of crashing startup. Tests prove
restart/replay, duplicate local replacement, retry exhaustion, conflict visibility, and absence of
note/evidence fields.

The backend OpenAPI currently has no idempotency operation ID input. `expectedVersion` prevents
stale overwrites for existing records; it cannot prove exactly-once behavior for a brand-new write
whose response is lost after the server commits. That remains a backend contract dependency.
