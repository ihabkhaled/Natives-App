# architecture/no-typescript-enum

**Severity:** error · **Scope:** all `src/**` files

## What it enforces

The TypeScript `enum` keyword MUST NEVER be used — `const enum` included. Enumerations are
modeled as `as const` objects with a derived union type.

## Why

`enum` emits nonstandard runtime code and awkward types; as-const objects give the same safety
with plain JavaScript output and better inference.

## Valid

```tsx
// src/shared/enums/status.enums.ts
export const STATUS = { Active: 'active' } as const;
export type Status = (typeof STATUS)[keyof typeof STATUS];
```

## Invalid

```tsx
// src/shared/enums/status.enums.ts
export enum Status {
  Active = 'active',
}
```

## How to fix

Replace the enum with an `as const` object plus a derived union type
(`(typeof OBJ)[keyof typeof OBJ]`), per rules/08.
