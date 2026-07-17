# Architecture Decision Records

Each ADR records one binding decision: the forces that produced it, what was chosen, what it costs,
what enforces it, and what would invalidate it. ADRs rank second in the authority order — below
security and privacy policy, above normative rules. When a rule and an ADR disagree, the ADR wins
and the rule is the bug.

An ADR is not a tutorial. It explains _why_ the boundary exists. The
[context maps](../../context/README.md) explain how the pieces connect today, the
[rules](../../rules/README.md) say what you must do, and the
[ESLint rule catalogue](../../docs/eslint/README.md) explains how each rule behaves.

## The records

| ADR                                                     | Decision                                                       | Enforced by                                                   |
| ------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------- |
| [0001](./0001-module-first-architecture.md)             | Five layers, one-way direction, one module per feature         | `no-restricted-layer-imports`, `quality:architecture`         |
| [0002](./0002-ui-only-components.md)                    | Components render props; no hooks, no logic                    | `no-hooks-in-components`, `no-inline-component-logic`         |
| [0003](./0003-hook-isolation.md)                        | Hook calls live only in `*.hook.ts`, one hook per file         | `no-built-in-hooks-outside-hook-files`, `one-hook-per-file`   |
| [0004](./0004-package-ownership.md)                     | Every vendor has exactly one owning directory                  | `no-raw-package-imports`, `quality:package-ownership`         |
| [0005](./0005-ionic-boundary.md)                        | Ionic enters through one re-export surface; overlays are hooks | `no-direct-ionic-import-outside-owner`                        |
| [0006](./0006-capacitor-boundary.md)                    | One owner per plugin, composed by platform facades             | `no-raw-capacitor-imports`, `require-native-listener-cleanup` |
| [0007](./0007-axios-nest-api-boundary.md)               | `src/packages/http` is the whole API boundary                  | `no-direct-axios-import-outside-owner`, `test:contract`       |
| [0008](./0008-tanstack-query-server-state-ownership.md) | Remote data belongs to TanStack Query                          | `no-inline-query-keys`, `no-server-state-in-client-store`     |
| [0009](./0009-zustand-client-state-ownership.md)        | Client-global state is Zustand: preferences + session status   | `no-server-state-in-client-store`, `no-inline-storage-keys`   |
| [0010](./0010-secure-token-storage.md)                  | Tokens live in secure storage only, via one repository         | `no-direct-storage-api-outside-platform`, `security:secrets`  |
| [0011](./0011-typescript-7-toolchain-compatibility.md)  | TS 7.0.2 compiles; TS 5.9.3 exists only for the lint parser    | `typecheck`, `check-toolchain-compatibility.mjs`              |
| [0012](./0012-error-normalization.md)                   | Axios error → `HttpError` → `AppError` → i18n key → copy       | `no-unsafe-error-display`, `quality:locales`                  |
| [0013](./0013-boundary-validation.md)                   | Parse every untrusted boundary with Zod at the edge            | `no-import-meta-env-outside-environment`, pure-file coverage  |
| [0014](./0014-testing-and-per-file-coverage.md)         | Per-file thresholds; four Vitest projects                      | `test:coverage:per-file`                                      |
| [0015](./0015-generated-ai-knowledge.md)                | Canonical docs are hand-written; `.ai/` is generated           | `knowledge:validate`, `quality:docs`                          |
| [0016](./0016-mock-api-mode.md)                         | Mock at the network with MSW, never in app code                | environment schema, `test:contract`                           |

## Adding a new ADR

1. **Check it is a decision.** If it constrains how code must be written, it is a rule (`rules/`).
   If it describes today's wiring, it is a map (`context/`). An ADR settles a tradeoff between
   viable options.
2. **Take the next number.** Zero-padded to four digits, kebab-case title:
   `NNNN-short-title.md`. Numbers are never reused, including for withdrawn records.
3. **Write all six sections** — Status, Context, Decision, Consequences, Alternatives considered,
   Supersession — using an existing record as the shape. Name real files, real APIs, and real rule
   ids; an ADR that cites nothing checkable cannot be verified later.
4. **Be honest in Consequences.** A record with no cost under "Negative" has not been thought
   through. Reviewers should read the cost first.
5. **Give it an enforcement mechanism** — an ESLint rule id, a script, or a test. An unenforced
   decision decays into folklore.
6. **Link it from this table** and from any `context/` map or module README it governs; the orphan
   check fails on a document nothing references.
7. **Rebuild the knowledge plane:** `npm run knowledge:build`, then `npm run knowledge:validate`.

Superseding an older record: set the old ADR's Status to `Superseded by NNNN`, leave its content
intact — the history is the value — and state the reversal in the new record's Context.
