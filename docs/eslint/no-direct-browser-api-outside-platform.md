# architecture/no-direct-browser-api-outside-platform

**Severity:** error · **Scope:** `src/**` except tests, `platform/`, `packages/`, and `main.tsx`

## What it enforces

Bare references to `document`, `window`, `navigator`, `localStorage`, `sessionStorage`,
`indexedDB`, `matchMedia`, or `location` — including `globalThis.*` / `window.*` member access —
MUST NEVER appear outside the platform layer and package owners. Locally declared bindings with
those names and plain property access such as `record.document` are not flagged.

## Why

Browser APIs are platform concerns; routing them through facades keeps features testable and
isolates web/native differences in one place.

## Valid

```tsx
// src/platform/lifecycle/document-chrome.facade.ts
export function applyTheme(isDark) {
  document.documentElement.classList.toggle('dark', isDark);
}
```

## Invalid

```tsx
// src/modules/demo/hooks/use-demo.hook.ts
export function useDemo() {
  return document.title;
}
```

## How to fix

Add (or reuse) a facade under `src/platform` that wraps the browser API, and call the facade from
feature code.
