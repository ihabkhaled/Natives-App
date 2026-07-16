# architecture/no-direct-virtuoso-import-outside-owner

**Severity:** error · **Scope:** `src/**` except tests (type-only imports exempt in packages/platform)

## What it enforces

Value imports of `react-virtuoso` MUST appear only inside its registered owner directory,
`src/packages/virtual-list`. Feature code NEVER imports Virtuoso directly; it renders the owner's
wrapper component.

## Why

Virtualized list behavior (sizing, overscan, endless scrolling) is standardized once in the owner
package, and the vendor stays swappable.

## Valid

```tsx
// src/packages/virtual-list/components/app-virtual-list/app-virtual-list.component.tsx
import { Virtuoso } from 'react-virtuoso';

export function AppVirtualList(props) {
  return <Virtuoso data={props.items} />;
}
```

## Invalid

```tsx
// src/modules/demo/components/demo-list/demo-list.component.tsx
import { Virtuoso } from 'react-virtuoso';

export function DemoList(props) {
  return <Virtuoso data={props.items} />;
}
```

## How to fix

Render lists through the wrapper exported by `@/packages/virtual-list` instead of importing
react-virtuoso in feature components.
