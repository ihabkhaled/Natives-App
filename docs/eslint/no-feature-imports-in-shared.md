# architecture/no-feature-imports-in-shared

**Severity:** error · **Scope:** files under `src/shared` (tests exempt)

## What it enforces

Shared code MUST NEVER import from `src/modules/**`. Any import from a file in the shared layer
that resolves into the modules layer is reported.

## Why

Shared sits below the feature modules in the dependency direction; knowing a specific feature
would invert that direction and make "shared" feature-coupled.

## Valid

```tsx
// src/shared/helpers/format.helper.ts
export function formatIt(value) {
  return String(value);
}
```

## Invalid

```tsx
// src/shared/helpers/format.helper.ts
import { useSession } from '@/modules/auth';

export function formatIt() {
  return useSession;
}
```

## How to fix

Move the shared piece down (into `shared/`, `platform/`, or a package) or move the
feature-specific piece up into the owning module.
