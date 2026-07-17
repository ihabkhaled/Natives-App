# Skill: Build a permission flow

**Use when:** a native capability needs the user's consent before it can be used.

## Required reading

- [rules/11 — Capacitor and native boundaries](../rules/11-capacitor-native-boundaries.md) — plugin
  and permission obligations.
- [rules/18 — Security](../rules/18-security.md) — consent is a privacy decision, not a UX detail.
- [permission-state.mapper.ts](../src/platform/permissions/permission-state.mapper.ts) — the app
  taxonomy and the raw-state normalizer.
- [permission-state.component.tsx](../src/shared/ui/permission-state/permission-state.component.tsx)
  — the denied-state UI that already exists.
- [context/native-capability-map](../context/native-capability-map.md) — what is installed today.

## Preconditions

- [ ] **Read this first.** Permission-heavy plugins (camera, geolocation, contacts, microphone,
      photos) are **deliberately not installed** in this boilerplate. Adding one requires a security
      review before the dependency lands — see [security-review](security-review.md). The mapper's
      own comment says it: optional capability plugins "must route their raw states through this
      mapper when they are installed".
- [ ] The purpose string is written and truthful — iOS rejects builds without one and users read it.
- [ ] The app degrades gracefully when permission is denied. "Feature is broken" is not a design.
- [ ] The plugin itself is installed and owned — see [capacitor-plugin](capacitor-plugin.md).

## Files

```text
src/platform/permissions/permission-state.mapper.ts    reference: PERMISSION_STATUS + mapRawPermissionState
src/platform/<capability>/<capability>.facade.ts       check / request, mapped to PermissionStatus
src/packages/capacitor-<name>/                         the plugin owner
src/modules/<module>/hooks/use-<capability>.hook.ts    the flow's state machine
src/shared/i18n/i18n-keys.constants.ts + locales/      rationale and denied copy
android/app/src/main/AndroidManifest.xml + ios/App/App/Info.plist   permission declarations
```

## Steps

1. **Normalize the raw state.** `mapRawPermissionState(rawState)` converts a plugin's vocabulary
   into `PERMISSION_STATUS`: `'granted' | 'limited'` → `Granted`; `'denied'` → `Denied`;
   `'prompt' | 'prompt-with-rationale'` → `NeedsRequest`; anything else → `Unknown`. Never branch on
   the plugin's own strings in a module — they differ per plugin and per platform.
2. Note `'limited'` maps to `Granted` deliberately: partial access (iOS photos) is access. If your
   feature must distinguish it, that is a mapper change with tests, not a module workaround.
3. **Expose check and request separately** from the platform facade — `checkXPermission()` and
   `requestXPermission()`, both returning `PermissionStatus`. Checking must never prompt; a silent
   prompt on mount is the anti-pattern this split prevents.
4. **Drive the flow from a hook.** The order is: check → if `NeedsRequest`, show rationale, then
   request on an explicit user action → re-map the result. Requesting without a user gesture burns
   the one prompt the OS grants you.
5. **Handle `Denied` as a real state,** not an error. Render `PermissionState` from `@/shared/ui`
   with `I18N_KEYS.states.permissionTitle` / `permissionMessage`, and offer the settings route out.
   The user cannot be re-prompted after a hard denial.
6. **Handle `Unknown`** as unavailable, not as denied: on web most permission plugins have no shim,
   and `isNativeRuntime()` should short-circuit the flow before it starts.
7. **Declare the permission natively.** Android manifest entries and iOS `NS*UsageDescription`
   strings are part of the change; `npm run cap:sync` regenerates the projects,
   `npm run cap:sync:check` proves they are not drifting.
8. Never cache "granted" in a store. The user can revoke it in system settings while the app is
   backgrounded; re-check on resume through `subscribeToAppLifecycle` from `@/platform`.

## Tests

- `permission-state.mapper.test.ts` — a pure mapper at **100%**: every raw string in every branch,
  including the unknown fallback.
- `<capability>.facade.test.ts` — mock the plugin; prove check does not prompt, request does, and
  both return mapped `PermissionStatus` values.
- `use-<capability>.hook.test.ts` — prove the state machine: granted skips the prompt;
  `NeedsRequest` shows the rationale and prompts only on the action; `Denied` renders the recovery
  state; `Unknown` on web never calls the plugin.
- Real prompts are OS UI — Vitest and Playwright cannot see them. Verify on a device; report it as
  device-verified, not as an automated pass.

## Security / accessibility / native considerations

- This is the **critical** risk lane by definition. Minimize scope: request the narrowest
  permission, as late as possible, for a purpose the user can see.
- Never log what the permission unlocks (coordinates, contacts, images) — redaction lives in
  `@/shared/security`.
- The rationale and denied copy need `en` and `ar`; the denied state must be announced, not just
  drawn.

## Documentation delta

- `context/native-capability-map.md` — the capability, its permission, and its denied behavior.
- `rules/11` and `rules/18` if the permission policy itself changes.
- The security review record for the newly installed plugin.

## Validation

```bash
npx vitest run --project unit src/platform/permissions src/platform/<capability>
npm run test:coverage:per-file
npm run quality:package-ownership
npm run cap:sync && npm run cap:sync:check
npm run android:verify
```

## Forbidden shortcuts

- Installing a permission-heavy plugin without the security review — the precondition above exists
  because the omission is invisible once merged.
- Branching on `'prompt-with-rationale'` inside a module — `mapRawPermissionState` is the one
  translator; the raw states are a vendor detail.
- Prompting on mount to "get it out of the way" — a denial is permanent and you have spent it.
- Importing the plugin outside its owner — `architecture/no-raw-capacitor-imports`.
- Treating `Unknown` as `Denied` — that shows a recovery screen on web where nothing was ever asked.

## Definition of done

- [ ] The plugin passed a security review before it was installed.
- [ ] Every raw state reaches the app through `mapRawPermissionState`; the mapper is at 100%.
- [ ] Check never prompts; request runs only from a user action with a visible rationale.
- [ ] Denied and Unknown both have real, translated, accessible behavior.
- [ ] Native declarations are synced, `cap:sync:check` is clean, and the flow is device-verified.
