# architecture/no-floating-native-listeners

**Severity:** error · **Scope:** all `src/**` files except tests

## What it enforces

Calls to listener registration functions — names matching `subscribeTo*`, `register*`, or
`startDeepLinkListener` — MUST NEVER stand alone as expression statements. The cleanup handle
they return must be captured.

## Why

A discarded cleanup handle means the native listener can never be unsubscribed, which leaks
listeners across app lifecycles.

## Valid

```tsx
// src/app/lifecycle/use-app-lifecycle.hook.ts
import { registerHardwareBackHandler } from '@/platform';

export function useAppLifecycle() {
  const cleanup = registerHardwareBackHandler({});
  return cleanup;
}
```

## Invalid

```tsx
// src/app/lifecycle/use-app-lifecycle.hook.ts
import { registerHardwareBackHandler } from '@/platform';

export function useAppLifecycle() {
  registerHardwareBackHandler({});
}
```

## How to fix

Assign the returned handle to a variable and invoke it on teardown — typically from the cleanup
function returned by the owning effect.
