# Rules corpus

Normative rules for Capacitor Ranger. This directory is canonical truth: module docs, skills, agent
prompts, and the generated `.ai/` acceleration plane all point back here. Generated summaries never
override these files.

Authority order: the security and privacy policy wins, then
[active ADRs](../architecture/adrs/README.md), then these rules, then public contracts and schemas,
then module documentation, then source and tests. When a rule and an ADR disagree, the ADR wins and
the rule is the bug.

Every rule states testable obligations and names the mechanism that enforces them — a real ESLint
rule id or a real `package.json` script. Where a rule cannot be mechanically enforced, it says so
explicitly instead of pretending. Start at [00-non-negotiable-rules](00-non-negotiable-rules.md);
the shortest path to a passing review is [31-review-checklist](31-review-checklist.md).

## The rules

| Rule                                                                                      | Covers                                                      |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [00 — Non-negotiable rules](00-non-negotiable-rules.md)                                   | The hard-invariant index; every other rule hangs off it     |
| [01 — Architecture and dependency direction](01-architecture-and-dependency-direction.md) | The one-way layer graph and what each layer owns            |
| [02 — Feature modules](02-feature-modules.md)                                             | Module anatomy, `index.ts` public surfaces, named exports   |
| [03 — Components](03-components.md)                                                       | Presentational `*.component.tsx`: props in, JSX out         |
| [04 — Containers](04-containers.md)                                                       | Composition seams: one hook, one component, no logic        |
| [05 — Hooks and effects](05-hooks-and-effects.md)                                         | `*.hook.ts` ownership, one hook per file, effect cleanup    |
| [06 — Services and use cases](06-services-use-cases.md)                                   | One React-free use case per `*.service.ts`                  |
| [07 — Gateways and repositories](07-gateways-repositories.md)                             | `request*` endpoint functions and persistence ports         |
| [08 — Types, interfaces, enums, constants](08-types-interfaces-enums-constants.md)        | Declaration homes; as-const objects instead of `enum`       |
| [09 — Package ownership](09-package-ownership.md)                                         | The vendor → owner registry and the facade discipline       |
| [10 — Ionic boundaries](10-ionic-boundaries.md)                                           | Ionic React reaches features only through its owner         |
| [11 — Capacitor and native boundaries](11-capacitor-native-boundaries.md)                 | Plugin owners, platform facades, listener cleanup           |
| [12 — Routing and deep links](12-routing-and-deep-links.md)                               | Route definitions, typed paths, the deep-link allowlist     |
| [13 — HTTP and the NestJS API](13-http-and-nest-api.md)                                   | The HTTP owner, error envelope, single-flight refresh       |
| [14 — State management](14-state-management.md)                                           | Client state in Zustand; persistence, versioning, migration |
| [15 — Server state and queries](15-server-state-and-queries.md)                           | TanStack Query ownership and `*.keys.ts` builders           |
| [16 — Forms and validation](16-forms-and-validation.md)                                   | React Hook Form + Zod through the forms owner               |
| [17 — Error handling](17-error-handling.md)                                               | `HttpError` → `AppError` → translated copy                  |
| [18 — Security](18-security.md)                                                           | Tokens, storage, environment, URLs, redaction               |
| [19 — Accessibility](19-accessibility.md)                                                 | WCAG 2.2 AA obligations and the axe gate                    |
| [20 — Performance](20-performance.md)                                                     | Virtualization, memoization, bundle and render budgets      |
| [21 — i18n and RTL](21-i18n-rtl.md)                                                       | Key-only copy, en/ar parity, direction handling             |
| [22 — Testing and coverage](22-testing-and-coverage.md)                                   | Suites, per-file 95%, pure-glob 100%                        |
| [23 — ESLint and TypeScript](23-eslint-typescript.md)                                     | Strictness flags, complexity budgets, zero warnings         |
| [24 — Documentation](24-documentation.md)                                                 | Module READMEs, rule docs, link integrity                   |
| [25 — Dependencies](25-dependencies.md)                                                   | Adding, pinning, owning, and removing packages              |
| [26 — Native release readiness](26-native-release-readiness.md)                           | Sync drift, Android verification, honest iOS reporting      |
| [27 — Observability](27-observability.md)                                                 | Logging, analytics, error reporting, redaction              |
| [28 — File naming](28-file-naming.md)                                                     | The kind-suffix taxonomy and kebab-case                     |
| [29 — Exceptions](29-exceptions.md)                                                       | The `EXC-nnnn` scheme and the exceptions in this codebase   |
| [30 — Release gates](30-release-gates.md)                                                 | `validate:web`, `validate:native`, `validate`               |
| [31 — Review checklist](31-review-checklist.md)                                           | What a reviewer checks that no machine can                  |
