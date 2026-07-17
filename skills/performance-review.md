# Skill: Run a performance review

**Use when:** a list, a heavy screen, a bundle addition, or a re-render complaint needs judgement.

## Required reading

- [rules/20 — Performance](../rules/20-performance.md) — virtualization, memoization, budgets.
- [virtual-list.component.tsx](../src/shared/ui/virtual-list/virtual-list.component.tsx) — the
  shared list primitive with its empty state.
- [AppVirtualList](../src/packages/virtual-list/components/app-virtual-list/) — the Virtuoso owner.
- [query-client.factory.ts](../src/packages/query/query-client.factory.ts) — the cache defaults that
  decide most perceived speed.
- [workbench-list](../src/modules/ui-workbench/components/workbench-list/) — virtualization in use.

## Preconditions

- [ ] You have a measurement, not a hunch — a profile, a bundle report, or a reproducible lag.
- [ ] You know which cost you are attacking: bundle size, first render, re-render, or network.
- [ ] The correctness gates already pass; do not tune a broken thing.

## Files

```text
(review — changes land in the file that actually costs)
src/shared/ui/virtual-list/**                  the list primitive
src/packages/query/query-client.factory.ts     cache defaults
src/modules/**/queries/*.keys.ts               key stability = request dedupe
src/modules/**/store/*.selectors.ts            derivation, kept pure
```

## Steps

1. **Measure before touching anything.** `npm run build` prints the chunk table; the React DevTools
   profiler shows what re-renders. An optimization without a before-number is folklore.
2. **Lists: virtualize.** Any list that can exceed a screenful uses `VirtualizedList` from
   `@/shared/ui`, which wraps `AppVirtualList`, which owns `react-virtuoso`. Importing Virtuoso
   directly fails `architecture/no-direct-virtuoso-import-outside-owner`. Items need a stable key —
   an index key defeats the recycling you came for.
3. **Network: fix the cache, not the component.** Duplicate requests almost always mean divergent
   query keys — `healthQueryKeys.status()` returns a fresh array whose _contents_ are stable, which
   is what lets TanStack dedupe. Tune `staleTime`/`gcTime` in the query-client factory or per query
   options; never add a manual cache beside the one you have
   (`architecture/no-server-state-in-client-store`).
4. **Re-renders: narrow the selector.** `useSessionStore((state) => state.markAuthenticated)`
   subscribes to one field. Selecting whole state re-renders on every unrelated change. Store
   selectors are pure files at 100% — that is where derivation belongs, not in a render.
5. **Memoize only with a measurement.** `useMemo`/`useCallback` cost allocation and complexity; they
   are legal only in `*.hook.ts` anyway (`architecture/no-built-in-hooks-outside-hook-files`). A
   component cannot memoize, and does not need to — it renders props.
6. **Bundle: check the owner.** A vendor arrives through exactly one package, so its cost is
   attributable. `@/packages/date` extends Day.js with two plugins at module load — adding a third
   is a bundle decision. Lazy-load at a route boundary, the way `start-app.ts` does
   `await import('@/tests/msw/browser')` only in mock mode.
7. **Do not fight the architecture.** "Skip the mapper for speed" trades a boundary for nanoseconds.
   The real wins are virtualization, cache keys, selector width, and not shipping the bytes.
8. **Re-measure and record both numbers.** If the delta is not worth writing down, revert the
   change.

## Tests

- Virtualized lists: `src/shared/ui/virtual-list/virtual-list.component.test.tsx` proves the empty
  state and item rendering; keep those assertions when swapping the strategy.
- Query dedupe: a hook test asserting the service was called once for two mounted consumers is worth
  more than a benchmark.
- No performance change may loosen a correctness test. If a test now fails, the optimization is
  wrong.
- Run: `npx vitest run --project unit src/shared/ui/virtual-list src/packages/query`.

## Security / accessibility / native considerations

- Virtualized lists must stay keyboard-navigable and announce correctly — `npm run test:a11y` after
  any list change.
- Native devices are the slow ones. A desktop profile is not evidence for a mid-range Android;
  measure on a device or say you did not.
- Do not disable animations globally for speed — the visual suite disables them for determinism
  only.

## Documentation delta

- `rules/20` if a budget is set, changed, or discovered.
- The module README when a screen adopts virtualization or a non-obvious cache posture.

## Validation

```bash
npm run build
npm run test:coverage
npm run quality:circular
npm run quality:duplicates
npm run test:visual
```

## Forbidden shortcuts

- `useMemo` on everything — allocation plus indirection, no measurement, no win.
- Importing `react-virtuoso` in a module — `architecture/no-direct-virtuoso-import-outside-owner`.
- Caching server data in Zustand to "avoid refetching" —
  `architecture/no-server-state-in-client-store`; the cache already exists.
- `staleTime: Infinity` globally to stop refetches — you have traded correctness for a number.
- Index keys in a virtualized list — the recycling breaks and rows flicker.

## Definition of done

- [ ] A before and an after number exist, on a representative device.
- [ ] Lists that can grow are virtualized through `@/shared/ui`.
- [ ] Duplicate fetches are gone via key stability, not a hand-rolled cache.
- [ ] No correctness, a11y or architecture gate was loosened to get the win.
- [ ] `npm run build` and the full unit suite still pass.
