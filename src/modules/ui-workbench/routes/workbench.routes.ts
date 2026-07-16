import { ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { WorkbenchContainer } from '../containers/workbench.container';
import { workbenchPath } from './workbench.paths';

export function getWorkbenchRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: workbenchPath(),
      exact: true,
      access: ROUTE_ACCESS.Public,
      component: WorkbenchContainer,
    },
  ];
}
