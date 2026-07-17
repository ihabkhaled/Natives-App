# architecture/no-feature-business-logic-in-app

**Severity:** error · **Scope:** files under `src/app` (tests exempt)

## What it enforces

The app layer MUST NEVER contain business-logic file kinds: `*.service.ts`, `*.gateway.ts`,
`*.repository.ts`, `*.store.ts`, `*.query.ts`, or `*.mutation.ts`. Any such file under `src/app`
is reported as a whole (at the Program node).

## Why

`src/app` only composes features into an application shell; behavior that belongs to a feature
must live in the module that owns it.

## Valid

```tsx
// src/app/startup/i18n-resources.helper.ts
export function buildResources() {
  return {};
}
```

## Invalid

```tsx
// src/app/services/load-user.service.ts
export async function loadUser() {
  return null;
}
```

## How to fix

Move the file into the owning feature module (for example `src/modules/<name>/services/...`) and
let the app layer consume it through the module's public surface.
