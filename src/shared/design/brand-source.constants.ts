/**
 * Provenance of the committed source art. The Ultimate Natives logo is treated
 * as the canonical, untouched source image; every raster/native derivative is
 * generated from it (scripts/branding/generate-brand-assets.mjs). The checksum
 * is pinned so an accidental edit or re-export is caught by the colocated test
 * and by the generation script. Confirm brand ownership and store-distribution
 * rights before public release.
 */
export const BRAND_LOGO_SOURCE_PATH = 'public/brand-logo.png';

export const BRAND_LOGO_SOURCE_SHA256 =
  'd5dc2db2b60df43eea7cf91dfb7f45fcfb5dc4e38d7692c1fe92b7980deb09cf';

export const BRAND_LOGO_DIMENSIONS = { width: 1152, height: 1152 } as const;
