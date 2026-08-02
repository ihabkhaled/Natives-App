import { describe, expect, it } from 'vitest';

import { ROUTE_ACCESS } from '@/shared/types';

import { TeamDirectoryContainer } from '../containers/team-directory.container';
import { teamDirectoryPath } from './team-directory.paths';
import { getTeamDirectoryRouteDefinitions } from './team-directory.routes';

describe('getTeamDirectoryRouteDefinitions', () => {
  it('registers exactly the public team directory route', () => {
    const definitions = getTeamDirectoryRouteDefinitions();

    expect(definitions).toHaveLength(1);
    expect(definitions[0]?.path).toBe(teamDirectoryPath());
    expect(definitions[0]?.exact).toBe(true);
  });

  it('reads the same signed in or out, so it is Public rather than PublicOnly', () => {
    expect(getTeamDirectoryRouteDefinitions()[0]?.access).toBe(ROUTE_ACCESS.Public);
  });

  it('renders the directory container', () => {
    expect(getTeamDirectoryRouteDefinitions()[0]?.component).toBe(TeamDirectoryContainer);
  });
});
