# Native capability map

Every installed Capacitor plugin, the owner that wraps it, the platform facade that turns it into
app policy, and the feature that consumes it. The two-tier shape is
[ADR 0006](../architecture/adrs/0006-capacitor-boundary.md).

## Installed plugins

| Plugin                                | Owner package                                    | Platform facade                             | Consumed by                               |
| ------------------------------------- | ------------------------------------------------ | ------------------------------------------- | ----------------------------------------- |
| `@capacitor/core`                     | `platform/runtime` (+ `packages/secure-storage`) | `runtime/runtime.facade.ts`                 | Everything that branches on native vs web |
| `@capacitor/app`                      | `packages/capacitor-app`                         | `back-button/`, `deep-links/`, `app-state/` | `use-app-lifecycle.hook.ts`               |
| `@capacitor/network`                  | `packages/capacitor-network`                     | `network/hooks/use-network-status.hook.ts`  | Offline banner; settings screen           |
| `@capacitor/preferences`              | `packages/capacitor-preferences`                 | `storage/preferences-storage.adapter.ts`    | `settings.store.ts` (persisted)           |
| `@capacitor/device`                   | `packages/capacitor-device`                      | `device/device.facade.ts`                   | `use-runtime-info.hook.ts` (settings)     |
| `@capacitor/splash-screen`            | `packages/capacitor-splash-screen`               | `lifecycle/native-chrome.facade.ts`         | `use-appearance-sync.hook.ts`             |
| `@capacitor/status-bar`               | `packages/capacitor-status-bar`                  | `lifecycle/native-chrome.facade.ts`         | `use-appearance-sync.hook.ts`             |
| `@capacitor/browser`                  | `packages/capacitor-browser`                     | `browser/` → `external-navigation/`         | (owner ready; no feature consumer yet)    |
| `@capacitor/haptics`                  | `packages/capacitor-haptics`                     | —                                           | (none yet)                                |
| `@capacitor/keyboard`                 | `packages/capacitor-keyboard`                    | —                                           | (none yet)                                |
| `@capacitor/share`                    | `packages/capacitor-share`                       | —                                           | (none yet)                                |
| `@aparajita/capacitor-secure-storage` | `packages/secure-storage`                        | (used directly by the auth repository)      | `token.repository.ts`                     |

The last four rows are honest, not aspirational. `capacitor-haptics`, `capacitor-keyboard`, and
`capacitor-share` are installed and wrapped but nothing calls them yet — they exist so the first
feature that needs a tap response, a keyboard dismiss, or a share sheet finds the owner already
built. `capacitor-browser` has its facade chain but no screen linking out yet. Their `Keyboard`
config in `capacitor.config.ts` is still live regardless, because it governs native resize
behavior whether or not JavaScript ever calls the plugin.

## Notable chains

**Hardware back** has exactly one owner. `back-button.facade.ts` wraps
`subscribeToHardwareBackButton` and applies the policy: go back while history exists, otherwise
`exitApp()`. `use-app-lifecycle.hook.ts` registers it once and unsubscribes on unmount. A second
registration anywhere would produce a double-pop — which is why the rule is one owner, not "be
careful".

**Deep links** are two files by design. `deep-links/deep-link.parser.ts` is pure and returns a
`Result`: it rejects by scheme, host, or path prefix and yields an internal path, never a raw URL.
`deep-links/deep-link.listener.ts` handles both entry points — `getLaunchUrl()` for cold start and
`subscribeToAppUrlOpen` for a running app — and routes the parsed path. The allowlist itself is
`src/app/router/deep-link-policy.constants.ts`; see [routing-map](./routing-map.md).

**External URLs** never open unvalidated. `external-navigation/external-navigation.facade.ts` checks
`isAllowedExternalUrl` (https only, no embedded credentials, no blocked host) and throws
`AppError(DEEP_LINK_REJECTED)` on rejection; only then does `browser/browser.facade.ts` open it.

**Native chrome** is startup-owned. `lifecycle/native-chrome.facade.ts` no-ops on web; on native it
applies the status-bar appearance for the resolved theme and hides the splash screen after first
render. `capacitor.config.ts` sets `launchShowDuration: 0` and `launchAutoHide: true` to match.

**Permissions** have a taxonomy but no consumer. `permissions/permission-state.mapper.ts` normalizes
raw plugin states (`granted`, `limited`, `denied`, `prompt`, `prompt-with-rationale`) into
`PERMISSION_STATUS`, and `src/shared/ui/permission-state/` renders the outcome. No installed plugin
requests a permission today; the mapper is the contract the first one must use.

## Deliberately NOT installed

These are the capabilities a boilerplate is tempted to pre-install. They are absent on purpose —
each one adds a native permission, a store-listing disclosure, and a review question that an app
which does not use it should not answer:

| Capability             | Package that would own it        | Add it when                        |
| ---------------------- | -------------------------------- | ---------------------------------- |
| Camera                 | `@capacitor/camera`              | a feature captures or picks images |
| Geolocation            | `@capacitor/geolocation`         | a feature needs position           |
| Filesystem             | `@capacitor/filesystem`          | a feature reads or writes files    |
| Push notifications     | `@capacitor/push-notifications`  | a backend delivers pushes          |
| Local notifications    | `@capacitor/local-notifications` | a feature schedules reminders      |
| Geofencing / BLE / NFC | third-party plugins              | a product requirement names them   |

## Adding a plugin

1. `npm install @capacitor/<plugin>` and register it in `eslint/package-ownership.config.mjs`.
2. Create `src/packages/capacitor-<plugin>/` with a facade plus `index.ts`. Normalize the plugin's
   shape into app types; return an unsubscribe function from every `addListener`.
3. Add a `src/platform/` facade if the capability needs policy (a decision, a fallback, a
   native-vs-web branch). Route permission states through `mapRawPermissionState`.
4. Consume it from a hook — never from a component.
5. `npm run cap:sync`, then `npm run cap:sync:check` to prove the native tree did not drift, then
   `npm run android:verify`. See `memory/native-pitfalls.md` for what fails and why.
