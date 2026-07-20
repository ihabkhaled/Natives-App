import type { AppRouteDefinition } from '@/shared/types';

import { ROUTE_PARAM_PREFIX, ROUTE_SEGMENT_SEPARATOR } from './app-bar-title.constants';

function segmentsMatch(pattern: string, actual: string | undefined): boolean {
  return pattern.startsWith(ROUTE_PARAM_PREFIX) || pattern === actual;
}

function pathMatchesPattern(pattern: string, path: string): boolean {
  const patternSegments = pattern.split(ROUTE_SEGMENT_SEPARATOR);
  const pathSegments = path.split(ROUTE_SEGMENT_SEPARATOR);
  if (patternSegments.length !== pathSegments.length) {
    return false;
  }
  return patternSegments.every((segment, index) => segmentsMatch(segment, pathSegments.at(index)));
}

/**
 * Resolve the title key the app bar shows for the current location. Exact
 * matches win over parameterised ones so `/practices` never borrows the title
 * of its session-detail child. Returns null for a location with no routed
 * metadata (the bar then falls back to the product name).
 */
export function selectRouteTitleKey(
  routes: readonly AppRouteDefinition[],
  path: string,
): string | null {
  const exact = routes.find((route) => route.path === path);
  const matched = exact ?? routes.find((route) => pathMatchesPattern(route.path, path));
  return matched?.meta?.titleKey ?? null;
}
