# architecture/no-react-in-services

**Severity:** error · **Scope:** `*.service.ts` files in `src/**`

## What it enforces

Service use-case files MUST NEVER import from `react` or `react-dom`. Any import declaration from
those packages, type-only included, is reported.

## Why

Services encode use cases as plain async functions; a React import means UI state or lifecycle
concerns have leaked into the business layer.

## Valid

```tsx
// src/modules/demo/services/load-demo.service.ts
export async function loadDemo() {
  return { id: 1 };
}
```

## Invalid

```tsx
// src/modules/demo/services/load-demo.service.ts
import { useState } from 'react';

export async function loadDemo() {
  return useState;
}
```

## How to fix

Keep the service a pure use-case function; orchestrate React state around it from a hook or
container that calls the service.
