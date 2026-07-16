# Android runbook

## Requirements

- JDK 21 (17+ works) on `PATH`. `npm run android:*` fails with a clear message if `java -version`
  does not run — it never pretends to have built.
- Android SDK with platform 36 (`compileSdk`/`targetSdk`) installed.
- `ANDROID_HOME` set, or Android Studio managing the SDK for you.

## Commands

```bash
npm run cap:sync         # build web + copy into android/
npm run cap:open:android # open in Android Studio
npm run cap:run:android  # sync + run on a device/emulator
npm run android:lint     # gradlew lint
npm run android:test     # gradlew test
npm run android:build    # gradlew assembleDebug
npm run android:verify   # sync + lint + test + build
```

`scripts/native/run-gradle.mjs` picks `gradlew.bat` on Windows and `./gradlew` elsewhere.

## Configuration

| Setting                    | Value                     | Where                                                            |
| -------------------------- | ------------------------- | ---------------------------------------------------------------- |
| `applicationId`            | `com.capacitorranger.app` | `android/app/build.gradle` (from `APP_IDENTITY`)                 |
| `minSdkVersion`            | 26                        | `android/variables.gradle`                                       |
| `compileSdk` / `targetSdk` | 36                        | `android/variables.gradle`                                       |
| Scheme                     | `https`                   | `capacitor.config.ts` (`server.androidScheme`)                   |
| Cleartext                  | disabled                  | `capacitor.config.ts` + `usesCleartextTraffic="false"`           |
| `allowBackup`              | `false`                   | `AndroidManifest.xml` — stops `adb backup` exfiltrating app data |
| Keyboard                   | `native` resize           | `capacitor.config.ts`                                            |

## Security posture

- **HTTPS scheme.** `androidScheme: 'https'` makes the WebView origin `https://localhost`, which
  keeps secure-context APIs available and avoids mixed-content downgrades.
- **No `server.url`.** A committed dev-server URL would ship an app that loads remote code. There
  is none, and `capacitor.config.ts` documents why.
- **Cleartext disabled** in both the Capacitor config and the manifest.
- **Exported components.** Only `MainActivity` is `exported="true"` (it needs the LAUNCHER
  intent). The `FileProvider` is `exported="false"`. Audit any new `<activity>`/`<receiver>` you
  add — an exported component is an entry point into your app.
- **Permissions.** Only `INTERNET`. Permission-heavy plugins are deliberately not installed; adding
  one requires a security review (see the permission-flow skill).

## Deep links

To accept App Links, add an `<intent-filter>` to `MainActivity` and host
`.well-known/assetlinks.json`. The allowlist in
[`src/app/router/deep-link-policy.constants.ts`](../../src/app/router/deep-link-policy.constants.ts)
must accept the host too — the native filter and the app policy are two independent gates and both
must pass.

## Sync drift

`npm run cap:sync:check` fails when the committed native tree differs from a fresh sync, or when
the native `applicationId` no longer matches `APP_IDENTITY`. Run `npm run cap:sync` and commit the
result whenever you add a plugin or change identity.

## Troubleshooting

| Symptom                     | Cause                                                              |
| --------------------------- | ------------------------------------------------------------------ |
| `java: command not found`   | No JDK on `PATH`.                                                  |
| `SDK location not found`    | Missing `ANDROID_HOME` or `android/local.properties` (gitignored). |
| Blank WebView               | Web assets not synced — run `npm run cap:sync`.                    |
| Plugin not found at runtime | Plugin added to `package.json` but `cap sync` not rerun.           |
