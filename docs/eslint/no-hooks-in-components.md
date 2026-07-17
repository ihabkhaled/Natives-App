# architecture/no-hooks-in-components

**Severity:** error · **Scope:** `*.component.tsx` files in `src/**`

## What it enforces

Presentational `*.component.tsx` files MUST NEVER invoke any hook — neither built-in React hooks
nor custom ones. Every direct call to a `use*` function inside a component file is reported.

## Why

Presentational components render prepared props only; state and effects belong to containers and
dedicated hook files, which keeps components trivially testable.

## Valid

```tsx
// src/modules/demo/components/user-card/user-card.component.tsx
export function UserCard(props) {
  return <div>{props.name}</div>;
}
```

## Invalid

```tsx
// src/modules/demo/components/user-card/user-card.component.tsx
import { useState } from 'react';

export function UserCard() {
  const [n] = useState(0);
  return <div>{n}</div>;
}
```

## How to fix

Move the hook call into the container (or a dedicated `*.hook.ts` file) and pass the resulting
data into the component as props.
