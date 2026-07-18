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

/** Deterministic Chromium derivatives produced by `npm run brand:generate`. */
export const BRAND_PWA_ICON_DERIVATIVES = [
  {
    path: 'public/pwa-icon-192.png',
    width: 192,
    height: 192,
    sha256: '5f82a79226b2fc32360892ef61b0a51d1ae16c7da46f575cf9ace2ce2ec61564',
  },
  {
    path: 'public/pwa-icon-512.png',
    width: 512,
    height: 512,
    sha256: '27dab641390942400f578a12010fd3a538bc2f793f9d9f863d7520df5bdf34d8',
  },
  {
    path: 'public/pwa-icon-maskable-512.png',
    width: 512,
    height: 512,
    sha256: 'd07e66d3a234048a0dc02220d138187cea7d348e903d5915bc5a9fd199e4396e',
  },
] as const;
