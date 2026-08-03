/**
 * Provenance of the committed source art. Every raster/native derivative is
 * generated from this file (scripts/branding/generate-brand-assets.mjs). The
 * checksum is pinned so an accidental edit or re-export is caught by the
 * colocated test and by the generation script. Confirm brand ownership and
 * store-distribution rights before public release.
 *
 * The committed file is NOT the byte-identical supplied original: the supplied
 * PNG was colorType 2 with no tRNS chunk — RGB with a near-black backdrop baked
 * in — so it rendered as a black slab on any surface that was not also black.
 * It has been re-encoded as RGBA (colorType 6) with that backdrop keyed out by
 * a flood fill seeded from the image border, which removes only the background
 * connected to the edge and leaves the artwork's own black outlines and letter
 * fills intact. Artwork, dimensions and palette are otherwise unchanged.
 */
export const BRAND_LOGO_SOURCE_PATH = 'public/brand-logo.png';

export const BRAND_LOGO_SOURCE_SHA256 =
  'cb47ddc4b3aaf54718d92c500c78e62eb4a154d15309ca8b2d6b5937772ef1f9';

export const BRAND_LOGO_DIMENSIONS = { width: 1152, height: 1152 } as const;

/** Deterministic Chromium derivatives produced by `npm run brand:generate`. */
export const BRAND_PWA_ICON_DERIVATIVES = [
  {
    path: 'public/pwa-icon-192.png',
    width: 192,
    height: 192,
    sha256: 'e9a4bc07dd619e2a9a2e59feb4ba68a5c268160b57d01287fe5a04eda361d59d',
  },
  {
    path: 'public/pwa-icon-512.png',
    width: 512,
    height: 512,
    sha256: 'ce5eb58d84e9dc744af3e7eba6ed01618a0764dd72914ed6952b9ad5bf517795',
  },
  {
    path: 'public/pwa-icon-maskable-512.png',
    width: 512,
    height: 512,
    sha256: '62e11df8070cc20b0a002174f388f3ac59783b13d7b29f3f6f23ab62bd029a1b',
  },
] as const;
