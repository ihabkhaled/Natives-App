# 10 — Ionic boundaries

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST import every Ionic component, hook, and helper from `@/packages/ionic`, which re-exports the
  approved surface and imports `./ionic-styles` as its single side effect.
- MUST add a new Ionic export to `src/packages/ionic/index.ts` first, deliberately, when a screen
  needs one — the export list is the app's Ionic vocabulary.
- MUST route Ionic's router bindings through `@/packages/router`, which is the only other directory
  allowed to touch `@ionic/react` (it pairs `IonRouterOutlet` with `IonReactRouter`).
- MUST wrap Ionic overlay hooks in a shared owner hook before feature code uses them:
  `useIonToast` behind `useAppToast`, `useIonAlert` behind `useConfirmAlert`.
- MUST wrap Ionic primitives in a `src/shared/ui` component when a pattern repeats — `AppButton`,
  `FormField`, `PageShell` — so tone, sizing, and a11y attributes stay consistent.

## Forbidden

- NEVER import from `@ionic/react` or `@ionic/react-router` outside `src/packages/ionic` and
  `src/packages/router`.
- NEVER import Ionic CSS from a feature file; `ionic-styles.ts` owns style registration once.
- NEVER call `useIonToast` or `useIonAlert` directly from a module hook — go through the shared UI
  owner so every toast in the app behaves identically.

## Rationale

Ionic is the single largest vendor surface in the app, and it changes across major versions. A
curated re-export means an Ionic upgrade shows up as a diff in one `index.ts` plus whatever it
breaks, instead of hundreds of import sites. It also keeps the design system honest: if a screen
wants a component the app has never used, that becomes a conscious addition rather than an accident.

## Valid

```tsx
// src/shared/ui/button/button.component.tsx
import { IonButton, IonSpinner } from '@/packages/ionic';

export function AppButton(props: AppButtonProps): React.JSX.Element {
  return (
    <IonButton color={BUTTON_TONE_TO_ION_COLOR[props.tone ?? 'primary']}>{props.label}</IonButton>
  );
}
```

## Invalid

```tsx
// src/modules/ui-workbench/components/workbench-buttons/workbench-buttons.component.tsx
import { IonButton } from '@ionic/react'; // owner is @/packages/ionic
import '@ionic/react/css/core.css'; // style registration is owned by ionic-styles.ts
```

## Enforcement

| Mechanism                                              | Command                             |
| ------------------------------------------------------ | ----------------------------------- |
| `architecture/no-direct-ionic-import-outside-owner`    | `npm run lint`                      |
| `architecture/no-raw-package-imports`                  | `npm run lint`                      |
| `architecture/no-third-party-hooks-outside-hook-files` | `npm run lint`                      |
| Ionic owner dirs match the registry                    | `npm run quality:package-ownership` |

Manual review where mechanical enforcement is impossible: nothing prevents `src/packages/ionic` from
re-exporting all of `@ionic/react`. Growth of that export list is the thing to watch — each new
entry should answer a screen that exists, not a screen someone might build.

## Definition of done

- [ ] No file outside the Ionic and router owners names `@ionic/react`.
- [ ] Any newly used Ionic component was added to the owner's export list on purpose.
- [ ] Repeated Ionic markup was promoted to a `src/shared/ui` primitive.

## Related

[09-package-ownership](09-package-ownership.md) · [03-components](03-components.md) ·
[12-routing-and-deep-links](12-routing-and-deep-links.md) ·
[../docs/eslint/no-direct-ionic-import-outside-owner.md](../docs/eslint/no-direct-ionic-import-outside-owner.md)

ADR: [0005](../architecture/adrs/0005-ionic-boundary.md).
