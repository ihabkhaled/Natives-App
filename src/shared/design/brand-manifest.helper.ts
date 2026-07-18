import {
  BRAND_FAVICON_ASSET,
  BRAND_MANIFEST_ROOT,
  BRAND_PWA_ICON_192_ASSET,
  BRAND_PWA_ICON_512_ASSET,
  BRAND_PWA_MASKABLE_ICON_512_ASSET,
} from './brand-assets.constants';
import type { BrandTokens } from './brand-tokens.constants';

/**
 * Builds the PWA web app manifest from the owned identity and brand tokens.
 * The committed public/manifest.webmanifest is this output; equality is proven
 * by the colocated test so the manifest cannot silently drift from the brand.
 *
 * Install icons are reproducible raster derivatives of the checksum-pinned
 * source logo. The maskable derivative adds a brand-black safe area so launchers
 * may crop it without cutting the mark.
 */
interface WebManifestIcon {
  readonly src: string;
  readonly sizes: string;
  readonly type: string;
  readonly purpose: string;
}

export interface WebManifest {
  readonly name: string;
  readonly short_name: string;
  readonly id: string;
  readonly description: string;
  readonly start_url: string;
  readonly scope: string;
  readonly display: string;
  readonly orientation: string;
  readonly lang: string;
  readonly dir: string;
  readonly background_color: string;
  readonly theme_color: string;
  readonly categories: readonly string[];
  readonly icons: readonly WebManifestIcon[];
}

export interface BrandManifestIdentity {
  readonly name: string;
  readonly shortName: string;
  readonly description: string;
  readonly lang: string;
  readonly dir: string;
}

export function buildWebManifest(
  identity: BrandManifestIdentity,
  tokens: BrandTokens,
): WebManifest {
  const brandBlack = tokens.palette.black;
  return {
    name: identity.name,
    short_name: identity.shortName,
    id: BRAND_MANIFEST_ROOT,
    description: identity.description,
    start_url: BRAND_MANIFEST_ROOT,
    scope: BRAND_MANIFEST_ROOT,
    display: 'standalone',
    orientation: 'portrait',
    lang: identity.lang,
    dir: identity.dir,
    background_color: brandBlack,
    theme_color: brandBlack,
    categories: ['sports'],
    icons: [
      { src: BRAND_FAVICON_ASSET, sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: BRAND_PWA_ICON_192_ASSET, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: BRAND_PWA_ICON_512_ASSET, sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: BRAND_PWA_MASKABLE_ICON_512_ASSET,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
