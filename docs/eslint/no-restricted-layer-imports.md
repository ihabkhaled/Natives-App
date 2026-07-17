# architecture/no-restricted-layer-imports

**Severity:** error · **Scope:** all `src/**` files except tests

## What it enforces

Internal imports MUST follow the one-way layer direction `app → modules → platform → shared →
packages`. Each layer may import itself and layers below it: `packages` imports only `packages`;
`shared` adds `packages`; `platform` adds `shared`; `modules` adds `platform`; `app` (and tests)
may import everything. Any import against the direction is reported.

## Why

A single downward dependency direction eliminates layer cycles and keeps lower layers reusable
without dragging upper-layer knowledge along.

## Valid

```tsx
// src/modules/demo/hooks/use-demo.hook.ts
import { useNetworkStatus } from '@/platform';

export function useDemo() {
  return useNetworkStatus();
}
```

## Invalid

```tsx
// src/shared/helpers/json.helper.ts
import { useNetworkStatus } from '@/platform';

export function parseIt() {
  return useNetworkStatus;
}
```

## How to fix

Move the needed code into a layer visible to both sides (usually downward into `shared/` or a
package), or restructure so the dependency points down the stack.
