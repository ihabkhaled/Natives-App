import type { AppRouteDefinition } from '@/shared/types';

/** The route whose path exactly matches the current location, or null. */
export function findActiveRoute(
  routes: readonly AppRouteDefinition[],
  path: string,
): AppRouteDefinition | null {
  return routes.find((route) => route.path === path) ?? null;
}
