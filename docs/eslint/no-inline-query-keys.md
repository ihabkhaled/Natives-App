# architecture/no-inline-query-keys

**Severity:** error · **Scope:** `src/**` except tests and `*.keys.ts` files

## What it enforces

A `queryKey` property MUST NEVER be assigned an inline array expression. Query keys are built
exclusively by the module's `*.keys.ts` key-builder objects.

## Why

Centralized key builders keep cache keys consistent between queries, mutations, and
invalidations; inline arrays drift and silently break cache invalidation.

## Valid

```tsx
// src/modules/demo/queries/demo.query.ts
import { demoKeys } from './demo.keys';

export function buildDemoQuery() {
  return { queryKey: demoKeys.list() };
}
```

## Invalid

```tsx
// src/modules/demo/queries/demo.query.ts
export function buildDemoQuery() {
  return { queryKey: ['demo', 'list'] };
}
```

## How to fix

Define a key builder in the module's `*.keys.ts` file (for example
`demoKeys.list = () => [...demoKeys.all, 'list']`) and call it wherever the key is needed.
