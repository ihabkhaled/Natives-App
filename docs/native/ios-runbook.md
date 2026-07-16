# iOS runbook

## Requirements

- macOS with Xcode and command line tools. There is no way around this: Apple's toolchain is
  macOS-only.
- CocoaPods or SPM as configured by Capacitor 8 (this project uses the SPM layout — see
  `ios/App/CapApp-SPM`).

## Commands

```bash
npm run cap:sync      # build web + copy into ios/
npm run cap:open:ios  # open Xcode
npm run cap:run:ios   # sync + run on a simulator/device
npm run ios:verify    # honest verification (see below)
```

## Honest verification

`npm run ios:verify` behaves differently by platform, on purpose:

- **On macOS with Xcode:** runs a real `xcodebuild ... build` against the iOS Simulator
  destination and fails the gate on a compile error.
- **Anywhere else:** prints `UNVERIFIED`, explains that compiling requires macOS + Xcode, and exits
  0 without claiming success.

This is deliberate. A gate that fakes a pass on Linux is worse than no gate: it teaches you to
trust a signal that means nothing. CI runs the real check in the dedicated `ios` job on
`macos-latest`.

**The iOS project in this repository has been generated and structurally checked, but has not been
compiled** — no macOS machine was available. Treat the first `npm run ios:verify` on a Mac as the
real verification.

## Configuration

| Setting                | Value                     | Where                              |
| ---------------------- | ------------------------- | ---------------------------------- |
| Bundle identifier      | `com.capacitorranger.app` | Xcode target (from `APP_IDENTITY`) |
| Deployment target      | 15.0                      | Xcode build settings               |
| App Transport Security | strict (no exceptions)    | `ios/App/App/Info.plist`           |
| Keyboard               | `native` resize           | `capacitor.config.ts`              |

## Security posture

- **No ATS exceptions.** `Info.plist` contains no `NSAppTransportSecurity` dictionary, so iOS
  enforces TLS. Do not add `NSAllowsArbitraryLoads` — if a backend needs it, fix the backend.
- **No `server.url`** in the Capacitor config.
- **Keychain** backs secure token storage.
- **Usage descriptions.** Any permission-bearing plugin needs its `NS*UsageDescription` string in
  `Info.plist`, localized. App Review rejects vague ones; write what you actually do with the data.

## Universal links

Add the Associated Domains capability (`applinks:your.domain`) and host
`.well-known/apple-app-site-association`. The app-side allowlist in
[`src/app/router/deep-link-policy.constants.ts`](../../src/app/router/deep-link-policy.constants.ts)
must also accept the host.

## Troubleshooting

| Symptom                         | Cause                                             |
| ------------------------------- | ------------------------------------------------- |
| `xcodebuild: command not found` | Xcode command line tools not installed.           |
| Signing errors                  | No development team selected in Xcode.            |
| Blank WebView                   | Web assets not synced — run `npm run cap:sync`.   |
| Plugin missing                  | `cap sync` not rerun after adding the dependency. |
