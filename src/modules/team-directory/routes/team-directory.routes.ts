import { ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { TeamDirectoryContainer } from '../containers/team-directory.container';
import { teamDirectoryPath } from './team-directory.paths';

/**
 * Public, not PublicOnly: the team directory is marketing content that reads
 * the same whether or not a visitor is signed in.
 */
export function getTeamDirectoryRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: teamDirectoryPath(),
      exact: true,
      access: ROUTE_ACCESS.Public,
      component: TeamDirectoryContainer,
    },
  ];
}
