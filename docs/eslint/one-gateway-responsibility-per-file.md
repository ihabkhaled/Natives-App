# architecture/one-gateway-responsibility-per-file

**Severity:** error · **Scope:** `*.gateway.ts` files in `src/**`

## What it enforces

Every value export of a gateway file MUST be a function named `request*` (`request` followed by a
capital letter). Type and interface exports are allowed; exported constants and functions with
other names are reported.

## Why

A gateway owns exactly one backend resource as a set of request functions; anything else in the
file is a second responsibility hiding in the I/O layer.

## Valid

```tsx
// src/modules/demo/gateways/demo.gateway.ts
export function requestDemo() {
  return fetchIt();
}
export function requestDemoList() {
  return fetchAll();
}
```

## Invalid

```tsx
// src/modules/demo/gateways/demo.gateway.ts
export function loadDemo() {
  return fetchIt();
}
```

## How to fix

Rename endpoint functions to `request<Thing>`, and move constants, mappers, and other
declarations into companion files (`*.constants.ts`, `*.mapper.ts`, …).
