# architecture/no-direct-navigation-outside-router-owner

**Severity:** error · **Scope:** `src/**` except tests and the `platform/` and `packages/` layers

## What it enforces

Code outside the router owner and platform facades MUST NEVER drive navigation through
`history.pushState/replaceState/back/forward/go` or `location.assign/replace/reload`. The rule
also matches these members reached via `globalThis.history` / `globalThis.location`.

## Why

Navigation state belongs to the router owner; direct history or location mutation bypasses route
guards, transitions, and the single navigation API.

## Valid

```tsx
// src/modules/demo/hooks/use-demo-navigation.hook.ts
import { useAppNavigation } from '@/packages/router';

export function useDemoNavigation() {
  return useAppNavigation();
}
```

## Invalid

```tsx
// src/modules/demo/services/go-back.service.ts
export function goBack() {
  globalThis.history.back();
}
```

## How to fix

Navigate through `@/packages/router` (for example `useAppNavigation`), or through a
`src/platform` facade for lifecycle actions such as full reloads.
