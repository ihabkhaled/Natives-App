import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from '@/shared/security';
import { ROUTE_ACCESS } from '@/shared/types';

import { PracticeAgendaContainer } from '../containers/practice-agenda.container';
import { practiceAgendaPattern } from './practice-agenda.paths';
import { getPracticeAgendaRouteDefinitions } from './practice-agenda.routes';

describe('getPracticeAgendaRouteDefinitions', () => {
  it('registers the plan behind the practice read grant', () => {
    const [route] = getPracticeAgendaRouteDefinitions();

    expect(route?.path).toBe(practiceAgendaPattern());
    expect(route?.access).toBe(ROUTE_ACCESS.Protected);
    expect(route?.component).toBe(PracticeAgendaContainer);
    // Read, not manage: a member may see the plan for a session they attend,
    // and the screen withholds the editing controls instead of the route.
    expect(route?.meta?.permissions).toEqual([PERMISSIONS.practicesRead]);
  });

  it('takes no navigation entry, because a nav item cannot resolve a session', () => {
    const [route] = getPracticeAgendaRouteDefinitions();

    expect(route?.meta?.nav).toBeNull();
    expect(route?.meta?.requiresTeamContext).toBe(true);
    expect(route?.meta?.offline).toBe(true);
  });
});
