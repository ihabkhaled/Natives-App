# architecture/no-raw-vendor-types-in-domain

**Severity:** error · **Scope:** files under `src/modules` (tests exempt)

## What it enforces

Feature modules MUST NEVER use type-only imports from vendor packages (`react` and `react-dom`
excepted). Modules consume app-owned types that the owner packages re-export instead of raw
vendor contracts.

## Why

Vendor types leaking into the domain couple feature code to a vendor's shape, making the vendor
impossible to swap without rewriting module signatures.

## Valid

```tsx
// src/modules/demo/repositories/token.repository.ts
import type { TokenStore } from '@/packages/http';

export function createRepo(): TokenStore {
  return null;
}
```

## Invalid

```tsx
// src/modules/demo/types/demo.types.ts
import type { AxiosResponse } from 'axios';

export type DemoResponse = AxiosResponse;
```

## How to fix

Re-export the type (or an app-owned equivalent) from the vendor's owner package and import that
from the module.
