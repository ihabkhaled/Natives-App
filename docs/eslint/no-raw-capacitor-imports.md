# architecture/no-raw-capacitor-imports

**Severity:** error · **Scope:** `src/**` except tests (type-only imports exempt in packages/platform)

## What it enforces

Value imports of any `@capacitor/*` plugin (and `@aparajita/capacitor-secure-storage`) MUST occur
only inside the vendor's registered owner directories — for example `@capacitor/network` only in
`src/packages/capacitor-network`, `@capacitor/core` only in `src/platform/runtime` and the
secure-storage owner. Even platform code may not import a plugin it does not own.

## Why

Each native plugin gets exactly one facade, so permission handling, error mapping, and web
fallbacks live in a single audited place.

## Valid

```tsx
// src/packages/capacitor-network/capacitor-network.facade.ts
import { Network } from '@capacitor/network';

export function getIt() {
  return Network.getStatus();
}
```

## Invalid

```tsx
// src/modules/demo/hooks/use-demo-network.hook.ts
import { Network } from '@capacitor/network';

export function useDemoNetwork() {
  return Network;
}
```

## How to fix

Consume the plugin through its owner package facade (for example
`@/packages/capacitor-network`), extending the facade when a capability is missing.
