# architecture/no-inline-storage-keys

**Severity:** error · **Scope:** `src/**` except tests and the `packages/` layer

## What it enforces

The first argument of a storage facade call (`getSecureValue`, `setSecureValue`,
`removeSecureValue`, `getPreferenceValue`, `setPreferenceValue`, `removePreferenceValue`) MUST
NEVER be a literal. Keys always come from the `STORAGE_KEYS` constants in `@/shared/config`.

## Why

A single key registry prevents collisions and orphaned entries, and makes it possible to audit or
migrate everything the app persists.

## Valid

```tsx
// src/modules/demo/repositories/token.repository.ts
import { getSecureValue } from '@/packages/secure-storage';
import { STORAGE_KEYS } from '@/shared/config';

export function createRepo() {
  return { read: () => getSecureValue(STORAGE_KEYS.authAccessToken) };
}
```

## Invalid

```tsx
// src/modules/demo/repositories/token.repository.ts
import { getSecureValue } from '@/packages/secure-storage';

export function createRepo() {
  return { read: () => getSecureValue('raw-key') };
}
```

## How to fix

Register the key in `STORAGE_KEYS` (`@/shared/config`) and pass that constant to the storage
facade.
