# architecture/no-default-export-in-app-source

**Severity:** error · **Scope:** all `src/**` files except tests

## What it enforces

Application source MUST use named exports only. `export default` declarations are NEVER allowed
in any `src/**` file.

## Why

Named exports keep symbol names consistent, greppable, and refactor-safe across the codebase.

## Valid

```tsx
// src/modules/demo/helpers/demo.helper.ts
export function formatDemo() {
  return 'x';
}
```

## Invalid

```tsx
// src/modules/demo/helpers/demo.helper.ts
export default function formatDemo() {
  return 'x';
}
```

## How to fix

Convert the default export into a named export and update the import sites to use the name.
