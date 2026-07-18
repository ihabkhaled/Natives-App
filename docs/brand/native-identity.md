# Native identity

The canonical identity lives in
[`src/shared/config/app-identity.constants.ts`](../../src/shared/config/app-identity.constants.ts) and
flows into [`capacitor.config.ts`](../../capacitor.config.ts).

| Field    | Value                     |
| -------- | ------------------------- |
| App name | `Ultimate Natives`        |
| App ID   | `com.ultimatenatives.app` |
| App slug | `ultimate-natives`        |

## Applied

- **Android**: `applicationId "com.ultimatenatives.app"` in `android/app/build.gradle`; display strings
  (`app_name`, `title_activity_main`, `package_name`, `custom_url_scheme`) rebranded in
  `android/app/src/main/res/values/strings.xml`.
- **iOS**: `PRODUCT_BUNDLE_IDENTIFIER = com.ultimatenatives.app` in the Xcode project; `CFBundleDisplayName`
  set to `Ultimate Natives` in `Info.plist`.
- **Web/PWA**: title, description, theme colour (`#0b0b0b`), manifest, and Apple touch icon in
  [`index.html`](../../index.html); the splash background colour in `capacitor.config.ts`.

## Deliberately deferred

- **Android code namespace** (`namespace`) and the `MainActivity` Java package remain the template value.
  Renaming them requires moving the source file and a verified native build, so they are left consistent
  with each other rather than half-changed. The store `applicationId` (which is independent of the code
  namespace) is rebranded.
- **Raster launcher/splash/appicon assets** still carry the template artwork. Regenerating them from
  [`public/brand-logo.png`](../../public/brand-logo.png) needs an image toolchain — see
  [asset generation](./asset-generation.md).

## Verification status

Native builds cannot run in this environment (no Android SDK/JDK, no macOS/Xcode). Android and iOS
identity, icon, and splash changes are therefore **UNVERIFIED** here and must be confirmed with
`npm run cap:sync:check` and a native build per the
[Android](../native/android-runbook.md) and [iOS](../native/ios-runbook.md) runbooks. Signing is covered
in the [signing runbook](./signing-runbook.md).
