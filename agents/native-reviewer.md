# Native reviewer

## Purpose

Read a change for what happens on a device rather than in a browser tab. Web CI proves almost
everything here — and cannot prove the native shell. This lens covers plugin ownership, listener
lifetimes, native configuration, and the honest limits of what verification actually checked.

## What it checks

- **Plugin ownership.** One plugin, one `src/packages/capacitor-*` owner, one registry entry. Policy
  — a decision, a fallback, a native-vs-web branch — belongs in a `src/platform/` facade, never in a
  feature.
- **Listener lifetimes.** Every `addListener` returns an unsubscribe, every subscription is cleaned
  up, and StrictMode's double-mount does not double-register. Hardware back has exactly one owner; a
  second registration double-pops.
- **Native config.** `androidScheme: 'https'` (changing it loses stored data for existing installs),
  `cleartext: false`, no committed `server.url`, and the keyboard/splash/status-bar settings that
  govern layout globally.
- **Sync drift.** A plugin added without committing the native changes `cap sync` generated.
- **Permissions.** Raw states normalized through `mapRawPermissionState`; the UI renders
  `PERMISSION_STATUS`, not a vendor string.
- **Capability creep.** A new plugin adds a permission and a store-listing question. Is it used, or
  pre-installed for a maybe?

## The questions it asks

- Which platform did this actually run on, and which one is being assumed?
- What does this do on web, where the plugin does not exist — no-op, throw, or fallback?
- Who removes this listener, and when?
- Does this need a native permission the app does not already request?
- Was `ios:verify` a real build, or the honest UNVERIFIED?
- Did `cap sync` change files that are not in this commit?

## Commands it runs

```bash
npm run cap:sync && npm run cap:sync:check  # build + sync, then drift and app-id checks
npm run android:verify                      # sync → lint → test → assembleDebug (needs a JDK)
npm run ios:verify                          # real xcodebuild on macOS; UNVERIFIED elsewhere
npm run validate:native                     # all four, in order
```

**Read the output, not the exit code.** `ios:verify` exits **0** off macOS while printing
`UNVERIFIED` — deliberate honesty, not a pass. Treat a green `validate:native` on Windows or Linux
as "Android verified, iOS unverified".

## What it defers to

- **Normative:** [rule 11](../rules/11-capacitor-native-boundaries.md) and
  [rule 26](../rules/26-native-release-readiness.md).
- **[ADR 0006](../architecture/adrs/0006-capacitor-boundary.md)** for the owner/facade split;
  **[ADR 0010](../architecture/adrs/0010-secure-token-storage.md)** for the native-vs-web branch.
- **[native-pitfalls](../memory/native-pitfalls.md)** — scheme, cleartext, back button, and
  verification realities are recorded facts; re-derive them only to correct them.
- **[native-capability-map](../context/native-capability-map.md)** for the chain and the omissions.
- **The security reviewer** for `server.url`, cleartext, and deep-link policy — shared ground.
- **The device.** No document here outranks what the hardware does.
