# Deployment templates (commented, not wired)

This boilerplate **does not deploy anything**. No workflow publishes, signs, or releases. The
templates below are starting points you must review, adapt, and enable deliberately.

Deployment is where secrets, signing identities, and store obligations enter a project. Turning it
on should be a decision with a name attached, not something inherited from a starter.

## Before you enable anything

- [ ] Secrets live in your CI secret store, never in `VITE_` variables (those ship to the client).
- [ ] Production `VITE_API_MODE=remote`. MSW must never start in production — startup already
      guards on `isProduction`, and the mock worker is a dynamic import so it stays out of the
      production bundle.
- [ ] `capacitor.config.ts` has no `server.url`.
- [ ] Release signing keys are in a secret store or a managed signing service.
- [ ] Someone owns the rollback path and has practiced it.

## Web (static hosting)

```yaml
# .github/workflows/deploy-web.yml — TEMPLATE, NOT ENABLED
# on:
#   push:
#     tags: ['v*']
# jobs:
#   deploy:
#     runs-on: ubuntu-latest
#     environment: production        # require an approval gate
#     steps:
#       - uses: actions/checkout@v4
#       - uses: actions/setup-node@v4
#         with: { node-version: '24', cache: npm }
#       - run: npm ci
#       - run: npm run validate:web  # never deploy an unvalidated build
#       - run: npm run build
#         env:
#           VITE_API_MODE: remote
#           VITE_API_BASE_URL: ${{ vars.API_BASE_URL }}
#           VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
#       - name: Upload dist/ to your host
#         run: echo "Add your host's CLI here"
```

Serve `dist/` with SPA fallback to `index.html`, or client routes 404 on refresh. This repo ships
[`vercel.json`](../../vercel.json) at the root: every non-file path rewrites to `/index.html` while
real assets, the manifest, icons, `offline.html`, and `service-worker.js` are served untouched. On
other static hosts add the equivalent single-page fallback. Add a strict CSP — it is the main
compensating control for the web token-storage tradeoff described in
[`docs/security/token-storage.md`](../security/token-storage.md).

## Android

```yaml
# TEMPLATE, NOT ENABLED
#       - uses: actions/setup-java@v4
#         with: { distribution: temurin, java-version: '21' }
#       - run: npm ci && npm run cap:sync
#       - name: Decode keystore
#         run: echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > android/release.keystore
#       - run: cd android && ./gradlew bundleRelease
#         env:
#           ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
#       - name: Upload to Play (r0adkll/upload-google-play or fastlane)
#         run: echo "Add your publishing step here"
```

Never commit a keystore. Add `android/release.keystore` to `.gitignore` before you create one.

## iOS

```yaml
# TEMPLATE, NOT ENABLED — macOS runner required
#     runs-on: macos-latest
#       - run: npm ci && npm run cap:sync
#       - name: Import signing certificate (apple-actions/import-codesign-certs)
#       - run: xcodebuild -workspace ios/App/App.xcworkspace -scheme App archive ...
#       - name: Upload to TestFlight (apple-actions/upload-testflight-build or fastlane)
```

## Release checklist

- [ ] `npm run validate` green (note which parts this environment could not verify).
- [ ] Version bumped; changelog written.
- [ ] `npm run cap:sync:check` clean.
- [ ] Android verified on a real device; iOS verified on macOS.
- [ ] Sentry DSN set and an error deliberately triggered to confirm reporting works.
- [ ] Rollback plan written down.
