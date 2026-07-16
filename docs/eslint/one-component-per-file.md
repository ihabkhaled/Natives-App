# architecture/one-component-per-file

**Severity:** error · **Scope:** all `src/**` files except tests

## What it enforces

A module-scope, capitalized, JSX-returning declaration counts as a React component. A component
MUST NEVER be declared outside the UI family (`component`, `container`, `provider`, `guard`,
`boundary`, `routes` files, plus `main.tsx`), and a UI-family file MUST declare exactly one
component — every additional one is reported.

## Why

One component per dedicated file keeps ownership, styling, tests, and companion files
predictable, and stops helpers from quietly growing UI.

## Valid

```tsx
// src/shared/ui/badge/badge.component.tsx
export function Badge(props) {
  return <span>{props.label}</span>;
}
```

## Invalid

```tsx
// src/shared/ui/badge/badge.component.tsx
export function Badge(props) {
  return <span>{props.label}</span>;
}
export function BadgeIcon() {
  return <i />;
}
```

## How to fix

Give each component its own component folder and `*.component.tsx` file; move any JSX-returning
function out of helper files into the UI family.
