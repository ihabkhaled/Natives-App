# architecture/no-inline-component-logic

**Severity:** error · **Scope:** `*.component.tsx` files in `src/**`

## What it enforces

Presentational components MUST contain no control-flow statements: `if`, `for`, `for-in`,
`for-of`, `while`, `do-while`, `switch`, and `try` are all forbidden anywhere in a
`*.component.tsx` file. Components render prepared props using expressions only.

## Why

Control flow in a component is misplaced preparation logic; keeping components expression-only
pushes decisions into hooks, helpers, and mappers where they are unit-testable.

## Valid

```tsx
// src/shared/ui/badge/badge.component.tsx
export function Badge(props) {
  return props.visible ? <span>{props.label}</span> : null;
}
```

## Invalid

```tsx
// src/shared/ui/badge/badge.component.tsx
export function Badge(props) {
  if (props.visible) {
    return <span>{props.label}</span>;
  }
  return null;
}
```

## How to fix

Prepare the data in a hook, helper, or mapper and hand the component ready-to-render props;
express residual branching as ternary or logical expressions.
