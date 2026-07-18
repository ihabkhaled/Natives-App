import { isFeatureEnabled } from '@/shared/config';
import type { RouteMeta } from '@/shared/types';

interface NormalizedRouteMeta {
  readonly requiredPermissions: readonly string[];
  readonly requiresTeamContext: boolean;
  readonly featureEnabled: boolean;
}

/** Apply guard defaults for a route that carries no (or partial) metadata. */
export function normalizeRouteMeta(meta: RouteMeta | undefined): NormalizedRouteMeta {
  return {
    requiredPermissions: meta?.permissions ?? [],
    requiresTeamContext: meta?.requiresTeamContext ?? false,
    featureEnabled: isFeatureEnabled(meta?.featureFlag ?? null),
  };
}
