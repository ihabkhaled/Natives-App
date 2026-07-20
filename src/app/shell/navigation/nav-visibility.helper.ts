import { isFeatureEnabled } from '@/shared/config';
import { hasAllPermissions } from '@/shared/security';
import { NAV_GROUP, type AppRouteDefinition, type NavGroup } from '@/shared/types';

import type {
  NavGroupDescriptor,
  NavItemDescriptor,
  NavVisibilityContext,
} from './navigation.types';

/** Section render order; a section with no permitted destination is dropped. */
const NAV_GROUP_ORDER: readonly NavGroup[] = [NAV_GROUP.Overview, NAV_GROUP.Team, NAV_GROUP.Manage];

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
    group: meta.nav.group,
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

/**
 * Bucket already-filtered destinations into their sidebar sections, keeping
 * the declared section order and dropping sections that ended up empty.
 */
export function groupVisibleNavItems(
  items: readonly NavItemDescriptor[],
): readonly NavGroupDescriptor[] {
  return NAV_GROUP_ORDER.flatMap((key) => {
    const groupItems = items.filter((item) => item.group === key);
    return groupItems.length === 0 ? [] : [{ key, items: groupItems }];
  });
}
