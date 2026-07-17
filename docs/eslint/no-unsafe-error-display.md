# architecture/no-unsafe-error-display

**Severity:** error · **Scope:** all `src/**` files except tests

## What it enforces

JSX MUST NEVER render a raw error. Expression children that are an `error` / `err` / `exception`
identifier, or a `.message` read off such an object (`error.message`, `props.error.message`), are
reported. JSX attribute expressions are exempt.

## Why

Raw error messages are untranslated, user-hostile, and can leak internals; users see copy mapped
from error codes instead.

## Valid

```tsx
// src/modules/demo/components/demo-view/demo-view.component.tsx
export function DemoView(props) {
  return <span>{props.errorMessage}</span>;
}
```

## Invalid

```tsx
// src/modules/demo/components/demo-view/demo-view.component.tsx
export function DemoView(props) {
  return <span>{props.error.message}</span>;
}
```

## How to fix

Map the error code to translated copy (shared mappers / i18n pipeline) before rendering, and pass
the prepared string into the component.
