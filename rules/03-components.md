# 03 — Components

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST keep `*.component.tsx` purely presentational: it receives a prepared view model as props and
  returns JSX.
- MUST declare exactly one component per UI file, inside a folder named after the file stem — so
  `health-status-card.component.tsx` lives in `components/health-status-card/`.
- MUST place the component's props type in a companion `*.types.ts` file.
- MUST take every `data-testid` from a companion constants file that reads from `TEST_IDS`.
- MUST receive already-translated strings; the component never decides what a label says.
- MUST express variance through ternaries in JSX and prop lookups, not through statements.
- MUST keep a component file under 150 lines and its render function under 120.

## Forbidden

- NEVER call a hook inside a presentational component — not `useState`, not `useTranslation`, not a
  local `use*` hook. Hooks belong to a `*.hook.ts` file consumed by a container.
- NEVER write `if`, `for`, `while`, `switch`, or `try` inside a component; those statements mean the
  view model was not prepared upstream.
- NEVER declare a type alias, an interface, or a module-scope literal in a component file.
- NEVER hard-code a `data-testid` string or user-visible copy in JSX.

## Rationale

If a component cannot fetch, branch, or translate, then the only way it can be wrong is visually —
which is exactly what snapshot, a11y, and visual tests cover cheaply. Pushing every decision into a
hook makes the decision unit-testable without rendering, and makes the component reusable in the
workbench, in tests, and in a second container without modification.

## Valid

```tsx
// src/modules/health/components/health-status-card/health-status-card.component.tsx
export function HealthStatusCard(props: HealthStatusCardProps): React.JSX.Element {
  return (
    <IonCard data-testid={HEALTH_CARD_TEST_IDS.card}>
      <IonCardTitle>{props.title}</IonCardTitle>
      {props.isLoading ? <LoadingState label={props.loadingLabel} /> : null}
    </IonCard>
  );
}
```

## Invalid

```tsx
// src/modules/health/components/health-status-card/health-status-card.component.tsx
export function HealthStatusCard(): React.JSX.Element {
  const { t } = useTranslation(); // hook in a presentational component
  const query = useHealthQuery(); // and a data dependency
  if (query.isLoading) {
    return <IonSpinner />; // control-flow statement
  }
  return <IonCard data-testid="health-card">{t('health.title')}</IonCard>; // raw id, raw key
}
```

## Enforcement

| Mechanism                                                                  | Command        |
| -------------------------------------------------------------------------- | -------------- |
| `architecture/no-hooks-in-components`                                      | `npm run lint` |
| `architecture/no-inline-component-logic`                                   | `npm run lint` |
| `architecture/one-component-per-file`                                      | `npm run lint` |
| `architecture/require-component-folder`                                    | `npm run lint` |
| `architecture/no-inline-test-ids`                                          | `npm run lint` |
| `max-lines` 150 / `max-lines-per-function` 120 on `src/**/*.component.tsx` | `npm run lint` |

Manual review where mechanical enforcement is impossible: whether the props _shape_ is a view model
or a leaked domain object. A component typed against `HealthStatus` still compiles; it just drags
the domain into the view.

## Definition of done

- [ ] The component calls no hook and contains no statement-level control flow.
- [ ] Its folder, file name, props type location, and test ids all follow the taxonomy.
- [ ] Every visible string arrives as a prop, already translated.

## Related

[04-containers](04-containers.md) · [05-hooks-and-effects](05-hooks-and-effects.md) ·
[19-accessibility](19-accessibility.md) · [21-i18n-rtl](21-i18n-rtl.md) ·
[../docs/eslint/no-hooks-in-components.md](../docs/eslint/no-hooks-in-components.md)

ADR: [0002](../architecture/adrs/0002-ui-only-components.md).
