# architecture/no-inline-routes

**Severity:** error · **Scope:** `src/**` except tests, `*.paths.ts`, `*.constants.ts`, `*.schema.ts`

## What it enforces

String literals that start with `/` (but not `//`) are treated as raw route or endpoint paths and
MUST NEVER appear outside the allowed homes. Paths live only in `*.paths.ts` builders and
`*.constants.ts` (or `*.schema.ts`) files.

## Why

Typed path builders make every navigable route and endpoint discoverable and refactorable from
one place instead of scattered magic strings.

## Valid

```tsx
// src/modules/demo/routes/demo.paths.ts
export function demoPath() {
  return '/demo';
}
```

## Invalid

```tsx
// src/modules/demo/hooks/use-demo-navigation.hook.ts
export function useDemoNavigation() {
  return '/demo';
}
```

## How to fix

Add a typed builder to the module's `*.paths.ts` (or a constant to `*.constants.ts`) and import
it where the path is consumed.
