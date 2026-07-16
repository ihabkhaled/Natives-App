# architecture/no-cross-module-deep-imports

**Severity:** error · **Scope:** all `src/**` files except tests, on imports into `src/modules/*`

## What it enforces

A file outside module X MUST import X only through `@/modules/<x>` — the module's public
`index.ts` surface. Deep imports such as `@/modules/health/hooks/use-health.hook` are NEVER
allowed. Imports within the same module are unrestricted.

## Why

`index.ts` is the module's contract; deep imports couple consumers to internal structure and make
refactoring inside a module a breaking change.

## Valid

```tsx
// src/modules/home/containers/home.container.tsx
import { HealthCard } from '@/modules/health';

export function HomeContainer() {
  return <HealthCard />;
}
```

## Invalid

```tsx
// src/modules/home/containers/home.container.tsx
import { useHealth } from '@/modules/health/hooks/use-health.hook';

export function HomeContainer() {
  const h = useHealth();
  return <div>{h.status}</div>;
}
```

## How to fix

Export the symbol from the target module's `index.ts` and import it from `@/modules/<name>`.
