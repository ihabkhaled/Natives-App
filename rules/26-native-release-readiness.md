# 26 — Native release readiness

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST keep `src/shared/config/app-identity.constants.ts` the single source of app identity;
  `capacitor.config.ts` imports `APP_IDENTITY` rather than restating an id.
- MUST run `npm run cap:sync` (build then `cap sync`) after any web build change that ships to
  native, and MUST commit the resulting native tree.
- MUST keep the native projects free of drift: `npm run cap:sync:check` asserts that `android/` and
  `ios/` exist, that the Android `applicationId` and the iOS bundle identifier match the canonical
  `appId`, and that the tracked native tree is clean after a sync.
- MUST verify Android for real — `npm run android:verify` runs sync, lint, unit tests, and
  `assembleDebug`.
- MUST report iOS honestly: `npm run ios:verify` builds with `xcodebuild` on macOS and prints
  **UNVERIFIED** anywhere else. An unverified iOS build is a known gap, never a claimed pass.
- MUST keep `webDir: 'dist'` aligned with the Vite output, `androidScheme: 'https'`, and
  `cleartext: false`.
- MUST review permissions, plugin additions, and splash/status-bar/keyboard behaviour as native
  changes, because they alter the manifests the stores review.

## Forbidden

- NEVER commit a `server.url` in `capacitor.config.ts`: a live-reload URL in a release build ships
  an app that loads its code from a developer's laptop.
- NEVER enable cleartext traffic.
- NEVER hand-edit generated native files that `cap sync` will overwrite; change the source of truth.
- NEVER claim iOS is verified from a non-macOS machine — the script's honesty is the point.

## Rationale

Native drift is silent: the web build changes, the native assets do not, and the bug appears only on
a device days later. Gating on a clean tree after `cap sync` makes drift a build failure instead of
a discovery. The iOS script deliberately exits 0 with an UNVERIFIED message rather than faking a
pass, because a green check that means nothing is worse than an honest gap CI can route to a Mac.

## Valid

```ts
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: APP_IDENTITY.appId, // one identity, imported — never restated
  appName: APP_IDENTITY.appName,
  webDir: 'dist',
  server: { androidScheme: 'https', cleartext: false },
};
```

## Invalid

```ts
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'com.capacitorranger.app', // duplicated identity, free to drift from APP_IDENTITY
  webDir: 'build', // does not match the Vite output
  server: { url: 'http://192.168.1.5:5173', cleartext: true }, // live-reload URL in a release build
};
```

## Enforcement

| Mechanism                                               | Command                   |
| ------------------------------------------------------- | ------------------------- |
| Project presence, identity match, post-sync cleanliness | `npm run cap:sync:check`  |
| Android lint, unit tests, and a real debug assembly     | `npm run android:verify`  |
| iOS build on macOS, explicit UNVERIFIED elsewhere       | `npm run ios:verify`      |
| The native half of the release gate                     | `npm run validate:native` |

Manual review where mechanical enforcement is impossible: everything a store reviewer looks at.
Permission strings, privacy manifests, icons, splash assets, signing, and version codes are outside
these gates — and on any machine without a Mac, so is the entire iOS compile.

## Definition of done

- [ ] `npm run validate:native` passes, and the native tree is committed and clean.
- [ ] No `server.url`, no cleartext, and identity still flows from `APP_IDENTITY`.
- [ ] Any iOS UNVERIFIED result is acknowledged and routed to a macOS run before release.

## Related

[11-capacitor-native-boundaries](11-capacitor-native-boundaries.md) ·
[30-release-gates](30-release-gates.md) · [18-security](18-security.md) ·
[25-dependencies](25-dependencies.md)
