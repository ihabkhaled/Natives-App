# architecture/no-app-imports-below-app

**Severity:** error · **Scope:** files in `modules/`, `platform/`, `shared/`, `packages/` (tests exempt)

## What it enforces

Code in the modules, platform, shared, or packages layers MUST NEVER import from `src/app`.
Only the app layer itself may consume app composition code. Every static import whose target
resolves into the `app` layer is reported.

## Why

`src/app` composes features into the running application; importing it from a lower layer inverts
the one-way dependency direction and invites cycles.

## Valid

```tsx
// src/app/router/route-registry.ts
import { getAuthRouteDefinitions } from '@/modules/auth';

export function routes() {
  return getAuthRouteDefinitions();
}
```

## Invalid

```tsx
// src/modules/demo/hooks/use-demo.hook.ts
import { AppShell } from '@/app';

export function useDemo() {
  return AppShell;
}
```

## How to fix

Move the piece you need out of `src/app` into `shared/`, `platform/`, or a package — or let the
app layer do the composing and hand results down as props or arguments.
