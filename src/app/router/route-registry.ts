import { getAuthRouteDefinitions } from '@/modules/auth';
import { getHomeRouteDefinitions, getNotFoundRouteDefinition } from '@/modules/home';
import { getSettingsRouteDefinitions } from '@/modules/settings';
import { getWorkbenchRouteDefinitions } from '@/modules/ui-workbench';
import type { AppRouteDefinition } from '@/shared/types';

/** Ordered route table; the catch-all not-found route must stay last. */
export function getAppRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    ...getAuthRouteDefinitions(),
    ...getHomeRouteDefinitions(),
    ...getSettingsRouteDefinitions(),
    ...getWorkbenchRouteDefinitions(),
  ];
}

export function getCatchAllRouteDefinition(): AppRouteDefinition {
  return getNotFoundRouteDefinition();
}
