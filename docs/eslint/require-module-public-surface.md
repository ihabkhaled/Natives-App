# architecture/require-module-public-surface

**Severity:** error · **Scope:** files under `src/modules/<name>/**`

## What it enforces

Every feature module MUST expose a public surface at `src/modules/<name>/index.ts`. The rule
checks the file's existence on disk and reports files belonging to a module that has none (the
check is cached once per module per lint run).

## Why

The `index.ts` surface is the module's only legal entry point for the rest of the app (see
`no-cross-module-deep-imports`); a module without one cannot be consumed correctly.

## Valid

```tsx
// src/modules/auth/services/login.service.ts
export async function loginUser() {
  return null;
}
```

## Invalid

```tsx
// src/modules/ghost-module/services/load-ghost.service.ts
export async function loadGhost() {
  return null;
}
```

## How to fix

Create `src/modules/<module>/index.ts` and export the module's public API (routes, containers,
hooks) from it. In the fixtures above, `auth` has an `index.ts` while `ghost-module` does not.
