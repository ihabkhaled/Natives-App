import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from '@/shared/security';
import { ROUTE_ACCESS } from '@/shared/types';

import { PracticeAgendaGroupsContainer } from '../containers/practice-agenda-groups.container';
import { practiceAgendaGroupsPattern } from './practice-agenda-groups.paths';
import { getPracticeAgendaGroupsRouteDefinitions } from './practice-agenda-groups.routes';

describe('getPracticeAgendaGroupsRouteDefinitions', () => {
  it('registers the screen behind the practice manage grant alone', () => {
    const [route] = getPracticeAgendaGroupsRouteDefinitions();

    expect(route?.path).toBe(practiceAgendaGroupsPattern());
    expect(route?.access).toBe(ROUTE_ACCESS.Protected);
    expect(route?.component).toBe(PracticeAgendaGroupsContainer);
    // Not a read/manage split: the plan carries private coach notes and
    // splitting the roster is a coach's decision, not a member's to see.
    expect(route?.meta?.permissions).toEqual([PERMISSIONS.practicesManage]);
  });

  it('takes no navigation entry and stays online-only, because it writes to a live plan', () => {
    const [route] = getPracticeAgendaGroupsRouteDefinitions();

    expect(route?.meta?.nav).toBeNull();
    expect(route?.meta?.requiresTeamContext).toBe(true);
    expect(route?.meta?.offline).toBe(false);
  });
});
