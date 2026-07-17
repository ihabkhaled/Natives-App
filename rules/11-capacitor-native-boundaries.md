# 11 — Capacitor and native boundaries

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST give every `@capacitor/*` plugin its own owner package named after it —
  `src/packages/capacitor-network` owns `@capacitor/network` — exposing a `*.facade.ts` with
  app-shaped functions.
- MUST confine `@capacitor/core` (and therefore `Capacitor.isNativePlatform()` and
  `Capacitor.getPlatform()`) to `src/platform/runtime`, plus the secure-storage owner that needs it
  to choose between hardware storage and the web fallback.
- MUST express a capability — not a plugin — in `src/platform`: `app-state`, `back-button`,
  `browser`, `deep-links`, `device`, `network`, `permissions`, `storage`, `lifecycle`.
- MUST return an unsubscribe function from every facade that registers a native listener, and MUST
  convert Capacitor's `Promise<PluginListenerHandle>` into that cleanup inside the owner.
- MUST reach browser globals — `document`, `window`, `navigator`, `matchMedia`, `location` — only
  from `src/platform` or a package owner; everything above consumes a facade.
- MUST degrade gracefully on web: a facade whose plugin has no web implementation returns a defined,
  documented fallback rather than throwing.

## Forbidden

- NEVER import an `@capacitor/*` plugin outside its owner package.
- NEVER branch on the platform in feature code; ask the platform facade a capability question
  instead of asking Capacitor what it is running on.
- NEVER discard the handle a listener registration returns — an uncaptured `subscribeTo*` call is a
  leak the linter treats as an error.

## Rationale

Plugins are the least portable part of a Capacitor app: they change APIs between majors, behave
differently per platform, and half of them no-op on web. One owner per plugin means each of those
surprises is contained in one file with one facade signature. Centralizing `@capacitor/core` keeps
platform detection out of features, which is what makes the web build testable in jsdom at all.

## Valid

```ts
// src/packages/capacitor-app/capacitor-app.facade.ts
export function subscribeToAppUrlOpen(onOpen: (url: string) => void): () => void {
  return toCleanup(
    App.addListener('appUrlOpen', (event) => {
      onOpen(event.url);
    }),
  );
}
```

## Invalid

```ts
// src/modules/settings/hooks/use-runtime-info.hook.ts
import { Network } from '@capacitor/network'; // owner is @/packages/capacitor-network

export function useRuntimeInfo() {
  useEffect(() => {
    Network.addListener('networkStatusChange', handleChange); // handle dropped, no cleanup
  }, []);
}
```

## Enforcement

| Mechanism                                             | Command                             |
| ----------------------------------------------------- | ----------------------------------- |
| `architecture/no-raw-capacitor-imports`               | `npm run lint`                      |
| `architecture/no-direct-browser-api-outside-platform` | `npm run lint`                      |
| `architecture/require-native-listener-cleanup`        | `npm run lint`                      |
| `architecture/no-floating-native-listeners`           | `npm run lint`                      |
| Plugin owner dirs exist and match the registry        | `npm run quality:package-ownership` |
| Native project drift after `cap sync`                 | `npm run cap:sync:check`            |

Manual review where mechanical enforcement is impossible: web-fallback _quality_. Lint proves the
plugin is wrapped; only a human can tell whether the web path returns something sensible or a lie
that will surface as a bug on the one platform CI actually runs.

## Definition of done

- [ ] The plugin has an owner package, a registry entry, and a facade with app-shaped names.
- [ ] Every listener path returns a cleanup, and every caller runs it on teardown.
- [ ] The web behavior of the facade is defined and documented, not accidental.

## Related

[09-package-ownership](09-package-ownership.md) · [05-hooks-and-effects](05-hooks-and-effects.md) ·
[26-native-release-readiness](26-native-release-readiness.md) ·
[../docs/eslint/no-raw-capacitor-imports.md](../docs/eslint/no-raw-capacitor-imports.md)

ADR: [0006](../architecture/adrs/0006-capacitor-boundary.md).
