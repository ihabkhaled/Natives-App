# 20 — Performance

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST virtualize any list that can exceed roughly one screen of rows, through
  `@/packages/virtual-list` (`AppVirtualList`) or the `src/shared/ui/virtual-list` wrapper.
- MUST memoize derived data in the screen hook against its real inputs — a translated item list is
  computed against the translator, not rebuilt on every keystroke.
- MUST keep list item components presentational so they re-render only when their props change.
- MUST let TanStack Query do the deduplication: one key, many subscribers, `staleTime` 30s, and no
  refetch on window focus.
- MUST keep the startup sequence lean and ordered — environment, i18n, HTTP wiring, reporting, mock
  mode, session — and MUST keep mock mode out of production with a dynamic import.
- MUST respect the size budgets that the linter enforces: 300 lines per file, 50 lines per function,
  150 lines per component, 200 per hook.
- MUST measure before optimizing: a claim of "faster" needs a number from a profile or a trace.

## Forbidden

- NEVER import `react-virtuoso` outside `src/packages/virtual-list`.
- NEVER render an unbounded `.map()` over server data as the primary list.
- NEVER duplicate a query's result into a store so a second screen can "avoid a fetch" — that trades
  a deduplicated request for a permanent staleness bug.
- NEVER add a memo, a callback, or a ref as a reflex; each one is code that must stay correct.

## Rationale

On a mid-range Android device the two things that actually hurt are long lists and unnecessary
re-renders of translated content, and both are structural rather than micro-optimizations. The
architecture pays for itself here: because components take prepared props and hooks own derivation,
memoization has an obvious home and a clear key. Virtualization behind an owner means the technique
can be swapped without touching a single screen.

## Valid

```ts
// src/modules/ui-workbench/hooks/use-workbench-screen.hook.ts
const items = useMemo(() => buildWorkbenchItems(t), [t]); // recompute only when the translator changes
```

## Invalid

```tsx
// src/modules/ui-workbench/components/workbench-list/workbench-list.component.tsx
import { Virtuoso } from 'react-virtuoso'; // owner is @/packages/virtual-list

export function WorkbenchList(props: WorkbenchListProps): React.JSX.Element {
  return (
    <>
      {props.items.map((item) => (
        <IonItem key={item.id}>{item.label}</IonItem>
      ))}
    </>
  ); // 500 rows, unvirtualized
}
```

## Enforcement

| Mechanism                                               | Command                             |
| ------------------------------------------------------- | ----------------------------------- |
| `architecture/no-direct-virtuoso-import-outside-owner`  | `npm run lint`                      |
| `react-hooks/exhaustive-deps` (keeps memo keys honest)  | `npm run lint`                      |
| `max-lines`, `max-lines-per-function`, `max-statements` | `npm run lint`                      |
| Virtual-list owner dir matches the registry             | `npm run quality:package-ownership` |
| Production bundle builds under the toolchain            | `npm run build`                     |
| Long-list rendering and scroll behaviour                | `npm run test:e2e`                  |

Manual review where mechanical enforcement is impossible: everything about actual speed. There is no
bundle-size budget gate and no render-count assertion in this repo — the rules above prevent the
known structural mistakes, but a regression in perceived performance is caught by profiling on a
real device, not by CI.

## Definition of done

- [ ] Every list that can grow is virtualized through the owner.
- [ ] Derived data is memoized against real inputs, and nothing else is memoized "just in case".
- [ ] Any performance claim in the change description is backed by a measurement.

## Related

[15-server-state-and-queries](15-server-state-and-queries.md) · [03-components](03-components.md) ·
[23-eslint-typescript](23-eslint-typescript.md) ·
[../docs/eslint/no-direct-virtuoso-import-outside-owner.md](../docs/eslint/no-direct-virtuoso-import-outside-owner.md)
