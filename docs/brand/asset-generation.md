# Brand asset generation

Every brand asset is either **committed source art** or a **generated derivative** of it. Nothing is
hand-drawn in place.

## Source (owned, committed, never edited)

| Asset                                                  | Provenance                                                                                                                        |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| [`public/brand-logo.png`](../../public/brand-logo.png) | The supplied 1152×1152 logo. Checksum pinned in [`brand-source.constants.ts`](../../src/shared/design/brand-source.constants.ts). |
| [`src/shared/design`](../../src/shared/design) tokens  | Black/gold/white palette, semantic themes, scale, status — see [brand system](./brand-system.md).                                 |

## Generated derivatives

### Text derivatives (verified in CI)

Produced by pure, typed generators and committed. Their equality with the generator output is asserted
byte-for-byte by the colocated tests, so they cannot silently drift and `npm run test` fails if a token
changes without refreshing them.

| Output                                                                             | Generator                                                                       | Guard                           |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------- |
| [`brand-tokens.generated.css`](../../src/shared/design/brand-tokens.generated.css) | [`brand-css.helper.ts`](../../src/shared/design/brand-css.helper.ts)            | `brand-css.helper.test.ts`      |
| [`public/favicon.svg`](../../public/favicon.svg)                                   | [`brand-favicon.helper.ts`](../../src/shared/design/brand-favicon.helper.ts)    | `brand-favicon.helper.test.ts`  |
| [`public/manifest.webmanifest`](../../public/manifest.webmanifest)                 | [`brand-manifest.helper.ts`](../../src/shared/design/brand-manifest.helper.ts)  | `brand-manifest.helper.test.ts` |
| `public/pwa-icon-*.png`                                                            | [`generate-brand-assets.mjs`](../../scripts/branding/generate-brand-assets.mjs) | `npm run pwa:verify`            |

The CSS is imported by [`src/app/styles/app.css`](../../src/app/styles/app.css); the favicon and manifest
are linked from [`index.html`](../../index.html).

### Raster and native derivatives (toolchain required)

PWA PNG icons use the exact Playwright/Chromium toolchain already pinned for browser tests. Android
adaptive/legacy launcher icons, Android splash, and the iOS `AppIcon.appiconset`/launch assets still
need a native asset toolchain (`@capacitor/assets` or `sharp`). Run:

```
npm run brand:generate
```

The script ([`generate-brand-assets.mjs`](../../scripts/branding/generate-brand-assets.mjs)) verifies the
source checksum, reports the text-derivative contract, and regenerates raster/native assets when a
toolchain is installed. In a toolchain-free environment it reports the raster step as **UNVERIFIED** and
exits without pretending it ran. See [native identity](./native-identity.md) for the native asset status.

## Refreshing after a token change

1. Edit the tokens in [`src/shared/design`](../../src/shared/design).
2. `npm run test` — the determinism tests fail and print the new expected content for any stale text
   derivative; update the committed file to match.
3. `npm run brand:generate` — refresh raster/native assets (needs a toolchain).
