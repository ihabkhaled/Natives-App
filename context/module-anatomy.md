# Module anatomy

The canonical shape of a feature module, and the order to build one in. `src/modules/health/` is the
reference slice: one `GET /health` endpoint carried through every layer, small enough to read in a
sitting and complete enough to copy. Its own `src/modules/health/README.md` documents the slice from
the inside; this page is the general pattern.

## Skeleton

```text
src/modules/<name>/
├── README.md                     public surface, anatomy, invariants, tests
├── index.ts                      the ONLY cross-module entry point
├── constants/<name>-api.constants.ts   endpoint paths (never inline literals)
├── schemas/<name>.schema.ts      wire contract (Zod) — parses mock AND remote
├── types/<name>.types.ts         app-owned domain types (no vendor types)
├── mappers/<name>.mapper.ts      DTO → domain; pure; 100% coverage required
├── gateways/<name>.gateway.ts    HTTP through @/packages/http; React-free
├── repositories/                 persistence, when the module owns any
├── services/<verb>-<noun>.service.ts   one use case per file; HttpError → AppError
├── store/<name>.store.ts         client state only, when the module owns any
├── queries/<name>.keys.ts        hierarchical key builder
├── queries/<name>.query.ts       query-options builder
├── mutations/use-*-mutation.hook.ts    writes
├── hooks/use-*-query.hook.ts     query → view model
├── hooks/use-*-screen.hook.ts    the screen view model (translated, formatted)
├── components/<component>/       UI-only folder: .component.tsx .types.ts .constants.ts index.ts
├── containers/<name>.container.tsx     one hook + one component
└── routes/<name>.paths.ts|.routes.ts   typed builders + route definitions
```

Not every module needs every folder. `home` has no gateway; `settings` has no HTTP at all; `health`
has no store. What is not optional: `index.ts`, `README.md`, and the direction of the arrows below.

## Build order — bottom-up

Each step is compilable and testable before the next exists. Build in this order and the module
never contains a layer waiting on a layer above it.

1. **Constants** — endpoint paths, and any route path added to `APP_PATHS` in `src/shared/config/`.
2. **Schema** — the wire contract. Write it against the real NestJS response.
3. **Types** — the domain shape the app wants, independent of the wire.
4. **Mapper** — DTO → domain. Pure, and the first thing worth a unit test.
5. **Gateway** — one resource, schema-parsed, `skipAuth` where the endpoint is public.
6. **Service** — one use case per file, React-free, converts `HttpError` to `AppError`.
7. **Query keys → query options → query hook** — or a store, if the state is client-owned.
8. **Screen hook** — translate, format, derive; return a finished view model.
9. **Component** — props in, JSX out, zero hooks.
10. **Container** — one hook, one component.
11. **Routes** — typed path builder, then the route definition with its access level.
12. **`index.ts`** — export the minimum other modules need; nothing else is public.
13. **`README.md`** — public surface table, anatomy, invariants, tests.

`npm run quality:architecture` fails a module missing `index.ts` or `README.md`.

## The arrows that must not reverse

```text
container → hook → query/store → service → gateway → @/packages/http
                                    ↓
                            mapper (pure) → types
```

- A component never calls a hook ([ADR 0002](../architecture/adrs/0002-ui-only-components.md)).
- A service never imports React ([ADR 0003](../architecture/adrs/0003-hook-isolation.md);
  `architecture/no-react-in-services`).
- A gateway never imports React and exports only `request*` functions.
- A store never imports a gateway, query, or mutation
  ([ADR 0009](../architecture/adrs/0009-zustand-client-state-ownership.md)).
- Another module reaches this one only through `@/modules/<name>`.

## Public surface discipline

`index.ts` is a re-export surface — `scripts/quality/validate-public-exports.mjs` rejects anything
else in it and checks every declared export resolves. Keep it minimal: `health` exports one
container, one key builder, one schema, and one type. Everything else is internal, which is what
makes the module safe to refactor.

`.ai/graphs/modules.json` is generated from these `index.ts` files, so the public surface an agent
sees is the one the compiler enforces.
