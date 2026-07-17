# architecture/no-types-outside-type-files

**Severity:** error · **Scope:** UI-family files (component/container/provider/guard/boundary/routes)

## What it enforces

UI-family files MUST NEVER declare a `type` alias. Every supporting type alias is externalized
into the companion `*.types.ts` file. Non-UI files such as hooks may still declare type aliases.

## Why

Type contracts kept in dedicated files can be imported without pulling in component code, and UI
files stay focused on rendering.

## Valid

```tsx
// src/shared/ui/badge/badge.types.ts
export type BadgeTone = 'info' | 'danger';
```

## Invalid

```tsx
// src/shared/ui/badge/badge.component.tsx
type BadgeTone = 'info' | 'danger';

export function Badge(props) {
  return <span>{props.label}</span>;
}
```

## How to fix

Move the alias into the component's companion `*.types.ts` file and bring it back with a
type-only import.
