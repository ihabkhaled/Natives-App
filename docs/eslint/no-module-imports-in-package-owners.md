# architecture/no-module-imports-in-package-owners

**Severity:** error · **Scope:** files under `src/packages` (tests exempt)

## What it enforces

Package owners MUST NEVER import from the `modules`, `shared`, `platform`, or `app` layers. A
package may depend only on its vendor and on other packages.

## Why

Owner packages exist to wrap vendors behind stable facades; importing application code couples
the wrapper to the app and breaks the one-way layer direction.

## Valid

```tsx
// src/packages/http/http-client.facade.ts
import { schemaBuilder } from '@/packages/schema';

export function buildIt() {
  return schemaBuilder.string();
}
```

## Invalid

```tsx
// src/packages/state/store.factory.ts
import { STORAGE_KEYS } from '@/shared/config';

export function buildIt() {
  return STORAGE_KEYS;
}
```

## How to fix

Keep the package vendor-only and pass application values (keys, config, callbacks) in as
parameters from the higher layer that composes it.
