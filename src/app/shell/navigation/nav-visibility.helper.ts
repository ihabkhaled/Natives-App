import { isFeatureEnabled } from '@/shared/config';
import { hasAllPermissions } from '@/shared/security';
import type { AppRouteDefinition } from '@/shared/types';

import type { NavItemDescriptor, NavVisibilityContext } from './navigation.types';

function toVisibleNavItem(
  route: AppRouteDefinition,
  context: NavVisibilityContext,
): NavItemDescriptor | null {
  const meta = route.meta;
  if (meta === undefined) {
    return null;
  }
  if (meta.nav === null) {
    return null;
  }
  if (!isFeatureEnabled(meta.featureFlag)) {
    return null;
  }
  if (!hasAllPermissions(context.permissions, meta.permissions)) {
    return null;
  }
  if (meta.requiresTeamContext && !context.hasTeamContext) {
    return null;
  }
  return {
    path: route.path,
    key: meta.key,
    order: meta.nav.order,
    iconName: meta.nav.iconName,
    labelKey: meta.nav.labelKey,
  };
}

/**
 * Pure derivation of the primary-navigation destinations from the route table
 * and the effective session. Permissions, feature flags, and team context all
 * filter here — never a role-name check.
 */
export function selectVisibleNavItems(
  routes: readonly AppRouteDefinition[],
  context: NavVisibilityContext,
): readonly NavItemDescriptor[] {
  return routes
    .flatMap((route) => {
      const item = toVisibleNavItem(route, context);
      return item === null ? [] : [item];
    })
    .sort((first, second) => first.order - second.order);
}
