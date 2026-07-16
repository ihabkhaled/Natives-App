# architecture/no-interfaces-outside-interface-files

**Severity:** error · **Scope:** UI-family files (component/container/provider/guard/boundary/routes)

## What it enforces

UI-family files MUST NEVER declare an `interface`. Every supporting interface is externalized
into the companion `*.types.ts` or `*.interfaces.ts` file. Non-UI files such as hooks may still
declare interfaces.

## Why

Keeping contracts in dedicated type files makes them importable without pulling in a component
and keeps UI files down to pure rendering.

## Valid

```tsx
// src/shared/ui/badge/badge.types.ts
export interface BadgeProps {
  readonly label: string;
}
```

## Invalid

```tsx
// src/shared/ui/badge/badge.component.tsx
interface BadgeProps {
  readonly label: string;
}

export function Badge(props: BadgeProps) {
  return <span>{props.label}</span>;
}
```

## How to fix

Move the interface into the component's companion `*.types.ts` (or `*.interfaces.ts`) file and
import it with a type-only import.
