# architecture/no-built-in-hooks-outside-hook-files

**Severity:** error · **Scope:** all `src/**` files except tests and `*.hook.ts` files

## What it enforces

Built-in React hooks (`useState`, `useEffect`, `useMemo`, `useRef`, and the rest of the React
hook set) MUST only be invoked inside dedicated `*.hook.ts` files. Containers, components,
services, and every other file kind NEVER call a built-in hook directly.

## Why

Hook files are the single home for stateful logic, which keeps containers thin and every other
layer framework-free and testable.

## Valid

```tsx
// src/modules/demo/hooks/use-counter.hook.ts
import { useState } from 'react';

export function useCounter() {
  return useState(0);
}
```

## Invalid

```tsx
// src/modules/demo/containers/demo.container.tsx
import { useState } from 'react';

export function DemoContainer() {
  const [n] = useState(0);
  return <div>{n}</div>;
}
```

## How to fix

Extract the stateful logic into a dedicated `use-*.hook.ts` file and invoke that custom hook from
the container instead.
