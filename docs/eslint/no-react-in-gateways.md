# architecture/no-react-in-gateways

**Severity:** error · **Scope:** `*.gateway.ts` and `*.repository.ts` files in `src/**`

## What it enforces

Gateway and repository files MUST NEVER import from `react` or `react-dom` — any import
declaration from those packages is reported, type-only imports included. These layers stay
framework-free.

## Why

Gateways and repositories are pure I/O boundaries; keeping React out makes them runnable and
testable outside a component tree.

## Valid

```tsx
// src/modules/demo/gateways/demo.gateway.ts
export function requestDemo(client, schema) {
  return client.get(schema.path, schema);
}
```

## Invalid

```tsx
// src/modules/demo/gateways/demo.gateway.ts
import { useEffect } from 'react';

export function requestDemo() {
  return useEffect;
}
```

## How to fix

Move React concerns (state, effects, element types) into hooks or containers; the gateway or
repository exposes plain async functions.
