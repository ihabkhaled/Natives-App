import type { DeepLinkPolicy } from '@/platform';
import { APP_IDENTITY, APP_PATHS } from '@/shared/config';

/** Strict allowlist for cold-start and runtime deep links. */
export const APP_DEEP_LINK_POLICY: DeepLinkPolicy = {
  allowedSchemes: ['https', APP_IDENTITY.appId],
  allowedHosts: ['capacitorranger.app', 'localhost'],
  allowedPathPrefixes: Object.values(APP_PATHS),
};
