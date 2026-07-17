# architecture/require-component-folder

**Severity:** error · **Scope:** `*.component.tsx` files in `src/**`

## What it enforces

Every `<name>.component.tsx` file MUST live in a directory named exactly `<name>` — the
component-folder contract. `badge.component.tsx` lives in a `badge/` folder; any other parent
directory name is reported.

## Why

The component folder groups the component with its companion files (types, constants, styles,
tests) under one predictable address.

## Valid

```tsx
// src/shared/ui/badge/badge.component.tsx
export function Badge(props) {
  return <span>{props.label}</span>;
}
```

## Invalid

```tsx
// src/shared/ui/badge.component.tsx
export function Badge(props) {
  return <span>{props.label}</span>;
}
```

## How to fix

Create a folder named after the component and move the component file (and its companions) into
it.
