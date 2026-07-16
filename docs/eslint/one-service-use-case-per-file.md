# architecture/one-service-use-case-per-file

**Severity:** error · **Scope:** `*.service.ts` files in `src/**`

## What it enforces

A service file MUST export exactly one use-case function; every additional exported function
declaration is reported. Internal, non-exported helper functions are allowed.

## Why

One use case per service keeps each business operation independently discoverable, testable, and
sized to its name.

## Valid

```tsx
// src/modules/demo/services/load-demo.service.ts
function mapInternal(x) {
  return x;
}
export async function loadDemo() {
  return mapInternal(1);
}
```

## Invalid

```tsx
// src/modules/demo/services/load-demo.service.ts
export async function loadDemo() {
  return 1;
}
export async function saveDemo() {
  return 2;
}
```

## How to fix

Split the second use case into its own `*.service.ts` file named after that use case.
