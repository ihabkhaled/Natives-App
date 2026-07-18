# Ultimate Natives brand system

The Ultimate Natives identity is **black, gold, and white**. This page documents the design tokens, how
they reach the running app, and the accessibility rules that constrain them.

## Where the tokens live

The owned source of truth is [`src/shared/design`](../../src/shared/design). Nothing else defines a brand
colour, font, spacing, radius, elevation, or motion value.

| File                                                                               | Owns                                                        |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [`brand-palette.constants.ts`](../../src/shared/design/brand-palette.constants.ts) | Raw brand colours (black, gold, white, neutrals, status).   |
| [`brand-theme.constants.ts`](../../src/shared/design/brand-theme.constants.ts)     | Light and dark semantic roles as full Ionic colour blocks.  |
| [`brand-scale.constants.ts`](../../src/shared/design/brand-scale.constants.ts)     | Typography, spacing, radius, elevation, motion.             |
| [`brand-status.constants.ts`](../../src/shared/design/brand-status.constants.ts)   | Status intents paired with a distinct icon per intent.      |
| [`brand-tokens.constants.ts`](../../src/shared/design/brand-tokens.constants.ts)   | The aggregate `BRAND_TOKENS` object used by the generators. |

## How tokens reach the app

The tokens are the **source**; the runtime stylesheet is a **generated derivative** — see
[asset generation](./asset-generation.md).

1. `buildBrandTokensCss(BRAND_TOKENS)` produces
   [`brand-tokens.generated.css`](../../src/shared/design/brand-tokens.generated.css).
2. [`src/app/styles/app.css`](../../src/app/styles/app.css) imports it.
3. The stylesheet emits `--ion-color-*` (so Ionic components inherit the brand) plus `--un-*` custom
   properties (brand black/gold/white, fonts, spacing, radius, elevation, motion).

Selectors use `:root:root` and `:root:root.ion-palette-dark` so the brand always out-specifies Ionic's
default variables regardless of import order. The dark palette is toggled by the existing appearance sync
(`.ion-palette-dark` on `<html>`).

## Colour roles

| Role                             | Light               | Dark                    | Notes                                                      |
| -------------------------------- | ------------------- | ----------------------- | ---------------------------------------------------------- |
| Surface/text                     | white / near-black  | brand-black / off-white | Body contrast ≥ 17:1.                                      |
| `primary`                        | near-black on white | gold on black           | Flips so buttons and links stay legible in both.           |
| `secondary`                      | deep gold           | bright gold             | Deep gold is the only gold safe as text on white.          |
| `tertiary`                       | gold                | gold                    | Fills/badges with black text (8.8:1). Never text on white. |
| `success` / `warning` / `danger` | AA on white         | AA on black             | Warning reuses the brand gold family.                      |

## Accessibility rules

- **Every text pairing meets WCAG 2.2 AA (≥ 4.5:1).** Proven in
  [`contrast.helper.test.ts`](../../src/shared/design/contrast.helper.test.ts), which fails the build if a
  token drifts below threshold.
- **Gold is never text on white** (2.1:1). Use it as a fill with black text, or as an accent on dark
  surfaces. The deep-gold `secondary` covers gold-toned text.
- **Colour is never the only status signal.** Each status carries a distinct icon; components render the
  icon plus a translated label. See `BRAND_STATUS_TOKENS`.
- **Focus is always visible** via `--un-focus-ring`, which meets contrast on both surfaces.
- **Reduced motion is respected** globally in `app.css`; motion tokens are durations/easings only.

## Logo and avatar

- [`BrandLogo`](../../src/shared/ui/brand-logo) renders the committed source art on the brand-black safe
  area with required alt text, in three sizes.
- [`AvatarFallback`](../../src/shared/ui/avatar-fallback) shows initials (or a person icon) as black on
  gold with an accessible label — identity is conveyed by text/icon, not colour.
