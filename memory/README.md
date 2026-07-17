# Memory

Durable facts that were expensive to discover and are cheap to forget: version constraints with
non-obvious reasons, environment traps, and the mistakes this architecture keeps catching.

## The records

| Record                                                        | Holds                                                               |
| ------------------------------------------------------------- | ------------------------------------------------------------------- |
| [known-pitfalls](./known-pitfalls.md)                         | Toolchain and environment traps hit while building this repo        |
| [native-pitfalls](./native-pitfalls.md)                       | Android/iOS realities: scheme, cleartext, back button, verification |
| [typescript-7-status](./typescript-7-status.md)               | The dual-compiler snapshot, the footgun, the removal trigger        |
| [ionic-router-compatibility](./ionic-router-compatibility.md) | Why React Router stays on v5 and what v7 would break                |
| [package-upgrade-notes](./package-upgrade-notes.md)           | Constrained versions, the `overrides` block, re-verification        |
| [recurring-review-findings](./recurring-review-findings.md)   | The violations that keep recurring and where the code belongs       |

## What memory is for

A fact earns a place here when it is **durable**, **non-obvious**, and **costly to rediscover** —
typically because the code shows _what_ was done but cannot show _why it had to be_. A version pin
looks like neglect until the constraint is written down; an UNVERIFIED exit code looks like a bug
until the honesty is explained.

## What memory is not

Memory **never** replaces source, tests, rules, or ADRs. It ranks last among canonical sources for a
reason: it records observations, not authority.

- **Source and tests** decide what the code does. When this directory disagrees with the code, the
  code wins and the note is stale.
- **[Rules](../rules/README.md)** decide what you must do. Memory explains why a rule keeps firing;
  it never grants an exception to one.
- **ADRs** (`architecture/adrs/`) decide the boundaries. Memory records a consequence of a decision;
  it never makes one. When a note starts arguing for a tradeoff, it has become an ADR — move it.
- **Context maps** (`context/`) describe the current wiring. Memory holds what bites, not what
  connects.

The practical test: if removing a note would change what someone is _allowed_ to do, it was never a
memory entry.

## Keeping it honest

Stale memory is worse than no memory, because it is confidently wrong. So:

- Every claim names a file, a version, or a command someone can re-run — see the verification block
  in [package-upgrade-notes](./package-upgrade-notes.md).
- Constraints carry their removal condition. `typescript-7-status` has an executable one:
  `node scripts/quality/check-toolchain-compatibility.mjs` fails the day the constraint lifts.
- When a workaround stops being necessary, delete the note. It is not history — `architecture/adrs/`
  is history.
- After editing anything here: `npm run knowledge:build` then `npm run knowledge:validate`, or the
  manifest hash check fails.
