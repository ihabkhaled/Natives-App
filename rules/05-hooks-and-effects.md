# 05 — Hooks and effects

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST invoke React's built-in hooks only inside a `*.hook.ts` (or `*.hook.tsx`) file; every other
  file kind is hook-free.
- MUST invoke a vendor hook — `useTranslation`, `useQuery`, `useForm`, `useIonToast` — only inside a
  hook file, and preferably only inside its owner package's hook.
- MUST export exactly one primary `use*` function per hook file; a helper that is not a hook belongs
  in a companion helper file.
- MUST name every exported `use*` function's home `*.hook.ts` — the single exception is a store
  file, which may export `use*Store`.
- MUST return a complete, translated, formatted view model from a screen hook, so its component has
  nothing left to decide.
- MUST return a cleanup function from any effect that registers a listener, and MUST capture the
  handle a listener registration hands back.
- MUST satisfy `react-hooks/exhaustive-deps` honestly: fix the dependency, never silence the rule.
- MUST keep a hook file under 200 lines and each function under 90.

## Forbidden

- NEVER export two hooks from one hook file.
- NEVER call a listener registration as a bare statement — `subscribeToAppUrlOpen(handler);` with no
  captured return is a leak by construction.
- NEVER leave an effect that subscribes without an unsubscribe path.

## Rationale

Confining hooks to `*.hook.ts` turns "is this component pure?" into a filename question the linter
can answer. One hook per file keeps the unit of reuse and the unit of testing identical, and lets a
screen hook compose smaller hooks rather than growing. Cleanup is mandatory because a native
listener outlives React: on Capacitor a leaked `App` listener keeps firing into an unmounted tree.

## Valid

```ts
// src/app/lifecycle/use-app-lifecycle.hook.ts
export function useAppLifecycle(): void {
  useEffect(() => {
    const stop = startDeepLinkListener({ policy: APP_DEEP_LINK_POLICY, onNavigate: navigate });
    return () => {
      stop();
    };
  }, [navigate]);
}
```

## Invalid

```ts
// src/app/lifecycle/use-app-lifecycle.hook.ts
export function useAppLifecycle(): void {
  useEffect(() => {
    startDeepLinkListener({ policy: APP_DEEP_LINK_POLICY, onNavigate: navigate }); // handle dropped
  }, []); // and no cleanup returned
}

export function useSecondThing(): void {} // a hook file exports one hook
```

## Enforcement

| Mechanism                                                           | Command        |
| ------------------------------------------------------------------- | -------------- |
| `architecture/no-built-in-hooks-outside-hook-files`                 | `npm run lint` |
| `architecture/no-third-party-hooks-outside-hook-files`              | `npm run lint` |
| `architecture/one-hook-per-file`                                    | `npm run lint` |
| `architecture/require-hook-filename`                                | `npm run lint` |
| `architecture/require-native-listener-cleanup`                      | `npm run lint` |
| `architecture/no-floating-native-listeners`                         | `npm run lint` |
| `react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`         | `npm run lint` |
| `max-lines` 200 / `max-lines-per-function` 90 on `src/**/*.hook.ts` | `npm run lint` |

Manual review where mechanical enforcement is impossible: the cleanup rules recognize the
`subscribeTo*`, `register*`, and `startDeepLinkListener` naming shapes. A listener registered under
a different name is invisible to them — name it into the convention rather than around it.

## Definition of done

- [ ] Every hook call in the change lives in a `*.hook.ts` file that exports one hook.
- [ ] Every subscription has a captured handle and a matching teardown.
- [ ] No `exhaustive-deps` warning was silenced.

## Related

[03-components](03-components.md) · [04-containers](04-containers.md) ·
[11-capacitor-native-boundaries](11-capacitor-native-boundaries.md) ·
[../docs/eslint/require-native-listener-cleanup.md](../docs/eslint/require-native-listener-cleanup.md)

ADR: [0003](../architecture/adrs/0003-hook-isolation.md).
