import { getExecutionContext } from '@/platform';
import { ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { WorkbenchContainer } from '../containers/workbench.container';
import { workbenchPath } from './workbench.paths';

/**
 * The workbench is an internal component gallery: it renders every state of
 * the design system, including the loading, error, conflict and empty states
 * that only exist so designers and reviewers can look at them. It is useful
 * for that, and for nothing a visitor should ever reach.
 *
 * It is therefore registered only outside production. In a production build
 * the path falls through to the catch-all, so a direct URL gets the product's
 * ordinary not-found page rather than an internal surface — and there is no
 * nav or sitemap entry pointing at it either way.
 *
 * Not a permission check: an unauthenticated visitor typing the URL must not
 * depend on RBAC resolving correctly to be kept out.
 */
export function getWorkbenchRouteDefinitions(): readonly AppRouteDefinition[] {
  if (getExecutionContext().isProduction) {
    return [];
  }
  return [
    {
      path: workbenchPath(),
      exact: true,
      access: ROUTE_ACCESS.Public,
      component: WorkbenchContainer,
    },
  ];
}
