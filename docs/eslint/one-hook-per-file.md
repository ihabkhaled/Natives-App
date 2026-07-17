# architecture/one-hook-per-file

**Severity:** error · **Scope:** `*.hook.ts` files in `src/**`

## What it enforces

A hook file MUST export exactly one primary `use*` hook. A second exported hook is reported, and
any exported function that is not a hook (helpers, formatters) is reported as well.

## Why

One hook per file keeps naming, discovery, and test scope one-to-one, and stops hook files from
becoming grab-bag utility modules.

## Valid

```tsx
// src/modules/demo/hooks/use-demo.hook.ts
export function useDemo() {
  return 1;
}
```

## Invalid

```tsx
// src/modules/demo/hooks/use-demo.hook.ts
export function useDemo() {
  return 1;
}
export function useOther() {
  return 2;
}
```

## How to fix

Move each extra hook into its own `use-*.hook.ts` file, and relocate non-hook exports to helper
or companion files.
