import { APP_IDENTITY } from '@/shared/config';

import type { BrandManifestIdentity } from './brand-manifest.helper';

/**
 * The identity fed into the generated PWA manifest. The display name is the
 * canonical app name; the short name and description are brand copy. English is
 * the manifest's declared language (the app localises at runtime).
 */
export const BRAND_MANIFEST_IDENTITY: BrandManifestIdentity = {
  name: APP_IDENTITY.appName,
  shortName: 'Natives',
  description: 'Team operations for the Ultimate Natives: practices, attendance, and performance.',
  lang: 'en',
  dir: 'ltr',
};
