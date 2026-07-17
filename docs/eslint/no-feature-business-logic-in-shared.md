# architecture/no-feature-business-logic-in-shared

**Severity:** error · **Scope:** files under `src/shared` (tests exempt)

## What it enforces

The shared layer MUST NEVER contain business-logic file kinds: `*.service.ts`, `*.gateway.ts`,
`*.repository.ts`, `*.store.ts`, `*.query.ts`, or `*.mutation.ts`. Any such file under
`src/shared` is reported as a whole (at the Program node).

## Why

Shared code stays generic and reusable; feature behavior belongs to the module that owns the
feature.

## Valid

```tsx
// src/shared/helpers/format.helper.ts
export function formatIt(value) {
  return String(value);
}
```

## Invalid

```tsx
// src/shared/gateways/user.gateway.ts
export function requestUser() {
  return null;
}
```

## How to fix

Move the gateway/service/store file into the owning feature module under `src/modules/<name>/`
and keep only generic helpers, UI, and config in `src/shared`.
