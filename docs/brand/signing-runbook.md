# Signing runbook

Signing keys and store credentials are **not brand assets** and are never committed. This page records
where signing configuration goes and how it is supplied at build time. No secret appears in Git or in the
web bundle.

## Android

- Debug builds use the default debug keystore (not committed, not for release).
- Release signing uses an upload keystore supplied by CI secrets, referenced from
  `android/app/build.gradle` via environment variables or an ignored `keystore.properties` — never
  literal values in the tracked project.

  | Secret                      | Purpose                        |
  | --------------------------- | ------------------------------ |
  | `ANDROID_KEYSTORE_BASE64`   | Base64 of the upload keystore. |
  | `ANDROID_KEYSTORE_PASSWORD` | Keystore password.             |
  | `ANDROID_KEY_ALIAS`         | Key alias.                     |
  | `ANDROID_KEY_PASSWORD`      | Key password.                  |

- `android/keystore.properties`, `*.jks`, and `*.keystore` must stay git-ignored.

## iOS

- Signing is macOS/Xcode-only and is **UNVERIFIED** off macOS.
- Use automatic signing for local development; release builds use a distribution certificate and
  provisioning profile installed on the CI runner (or App Store Connect API key), never checked in.

  | Secret                        | Purpose                          |
  | ----------------------------- | -------------------------------- |
  | `APPLE_DISTRIBUTION_CERT_P12` | Base64 distribution certificate. |
  | `APPLE_CERT_PASSWORD`         | Certificate password.            |
  | `APP_STORE_CONNECT_API_KEY`   | Upload/notarization key.         |

- Bundle identifier: `com.ultimatenatives.app` (see [native identity](./native-identity.md)).

## Rules

- Production cannot be built with placeholder signing material.
- Rotate compromised keys via the store console; record rotations in the operations log.
- CI injects secrets from the secret manager at build time only; they are never printed to logs.
