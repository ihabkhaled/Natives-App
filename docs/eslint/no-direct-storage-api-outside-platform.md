# architecture/no-direct-storage-api-outside-platform

**Severity:** error · **Scope:** `src/**` except tests and the `platform/` and `packages/` layers

## What it enforces

References to `localStorage`, `sessionStorage`, or `indexedDB` — bare or via
`globalThis.*` / `window.*` — MUST NEVER appear outside the platform layer and package owners.
Object property keys and type members with those names are not flagged.

## Why

Persistence goes through one owned surface so key management, encryption, and the web/native
storage split stay consistent.

## Valid

```tsx
// src/packages/secure-storage/secure-storage.facade.ts
export function readMirror(key) {
  return globalThis.sessionStorage.getItem(key);
}
```

## Invalid

```tsx
// src/modules/demo/services/save-demo.service.ts
export function saveDemo(value) {
  localStorage.setItem('demo', value);
}
```

## How to fix

Persist through the `@/platform` storage facade or `@/packages/secure-storage` instead of
touching web storage primitives directly.
