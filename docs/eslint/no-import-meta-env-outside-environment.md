# architecture/no-import-meta-env-outside-environment

**Severity:** error · **Scope:** all `src/**` files except `src/packages/environment`

## What it enforces

`import.meta.env` MUST only be read inside the environment owner, `src/packages/environment`.
Everywhere else, configuration is consumed through the validated facade exported by
`@/packages/environment`.

## Why

A single owner validates and types the raw Vite variables once, so the rest of the app never
depends on untyped, unvalidated environment strings.

## Valid

```tsx
// src/packages/environment/environment.facade.ts
export function readMode() {
  return import.meta.env.MODE;
}
```

## Invalid

```tsx
// src/modules/demo/services/load-demo.service.ts
export function loadDemo() {
  return import.meta.env.VITE_API_BASE_URL;
}
```

## How to fix

Read the value from the environment facade (for example `getEnvironment().apiBaseUrl`), adding it
to the validated environment schema if it does not exist yet.
