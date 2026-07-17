# architecture/require-native-listener-cleanup

**Severity:** error · **Scope:** all `src/**` files except tests

## What it enforces

A `useEffect` callback that registers a native listener — a call matching `subscribeTo*`,
`register*`, or `startDeepLinkListener` — MUST return a cleanup function. Effects with a block
body and no `return <value>` of their own are reported (returns inside nested functions do not
count).

## Why

Effects re-run and unmount; a registration without a returned cleanup leaks native listeners on
every remount and keeps handlers alive after teardown.

## Valid

```tsx
// src/platform/network/hooks/use-net.hook.ts
import { useEffect } from 'react';
import { subscribeToNetworkChanges } from '@/packages/capacitor-network';

export function useNet() {
  useEffect(() => {
    const cleanup = subscribeToNetworkChanges(() => undefined);
    return () => {
      cleanup();
    };
  }, []);
}
```

## Invalid

```tsx
// src/platform/network/hooks/use-net.hook.ts
import { useEffect } from 'react';
import { subscribeToNetworkChanges } from '@/packages/capacitor-network';

export function useNet() {
  useEffect(() => {
    const cleanup = subscribeToNetworkChanges(() => undefined);
    void cleanup;
  }, []);
}
```

## How to fix

Capture the handle returned by the registration and return a function from the effect that
invokes it.
