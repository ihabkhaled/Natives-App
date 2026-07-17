# architecture/require-hook-filename

**Severity:** error · **Scope:** `src/**` except tests, `*.hook.ts`, `*.store.ts`, and `index.ts` files

## What it enforces

An exported function declaration named `use*` MUST live in a `*.hook.ts` file. Store files are
exempt so they can export their `use*Store` hook, and `index.ts` files are exempt for re-exports;
every other file kind reporting a hook export is an error.

## Why

The `*.hook.ts` suffix is the taxonomy's marker for stateful logic; hooks hiding in helpers or
services defeat the file-kind contracts the other rules build on.

## Valid

```tsx
// src/modules/demo/store/demo.store.ts
export function useDemoStore() {
  return 1;
}
```

## Invalid

```tsx
// src/modules/demo/helpers/demo.helper.ts
export function useDemo() {
  return 1;
}
```

## How to fix

Move the hook into `hooks/use-<name>.hook.ts` (or rename the file to the hook suffix) so the file
kind matches its content.
