# Context maps

How this repository is wired **today**. Where an ADR records why a boundary exists and a rule says
what you must do, a context map answers "what connects to what, and where do I look".

These maps describe the implemented repository. If a map and the source disagree, the source is
right and the map is a bug — fix it in the same change.

## The maps

| Map                                                 | Answers                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| [architecture-map](./architecture-map.md)           | The five layers, the one-way rule, what lives where, entry points  |
| [dependency-map](./dependency-map.md)               | Every vendor, its owner, and why that owner exists                 |
| [module-anatomy](./module-anatomy.md)               | The canonical module skeleton and the bottom-up build order        |
| [package-ownership](./package-ownership.md)         | The registry, the rule family, the type-only exception, the script |
| [api-flow](./api-flow.md)                           | Container → hook → query → service → gateway → Axios → MSW/Nest    |
| [auth-flow](./auth-flow.md)                         | Login, token storage, single-flight refresh, failure, logout       |
| [error-flow](./error-flow.md)                       | Axios error → `HttpError` → `AppError` → i18n key → UI copy        |
| [native-capability-map](./native-capability-map.md) | Plugin → owner → platform facade → consumer, and what is absent    |
| [routing-map](./routing-map.md)                     | Route table, access levels, guard behavior, deep-link allowlist    |
| [state-ownership-map](./state-ownership-map.md)     | Server vs client state — and what belongs in neither               |
| [test-strategy-map](./test-strategy-map.md)         | Six test layers, what each proves, the coverage policy             |
| [release-gates](./release-gates.md)                 | The real gate chain and what each link proves                      |

## Where to start

- **New to the repo:** [architecture-map](./architecture-map.md) →
  [module-anatomy](./module-anatomy.md) → `src/modules/health/README.md` (the reference slice).
- **Adding a feature:** [module-anatomy](./module-anatomy.md) → [api-flow](./api-flow.md) →
  [state-ownership-map](./state-ownership-map.md).
- **Touching auth or tokens:** [auth-flow](./auth-flow.md) →
  [ADR 0010](../architecture/adrs/0010-secure-token-storage.md) → the critical-lane gates in
  [release-gates](./release-gates.md).
- **Adding a dependency:** [package-ownership](./package-ownership.md) →
  [dependency-map](./dependency-map.md) → `memory/package-upgrade-notes.md`.
- **Adding a plugin:** [native-capability-map](./native-capability-map.md) →
  `memory/native-pitfalls.md`.
- **Debugging a failing gate:** [release-gates](./release-gates.md) → `memory/known-pitfalls.md`.

## Related

- `architecture/adrs/` — why each boundary exists. Start with the
  [ADR index](../architecture/adrs/README.md).
- [Rules](../rules/README.md) — what you must do. Normative; a map never overrides one.
- [Memory](../memory/README.md) — durable facts and pitfalls that cost time to rediscover.
- [Review lenses](../agents/README.md) — specialists that read these maps.
- `docs/eslint/` — one page per architecture rule; see the
  [rule catalogue](../docs/eslint/README.md).
- `.ai/` — generated routing aids. Never edit; regenerate with `npm run knowledge:build`.
