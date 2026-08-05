import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { PracticeAgendaGroupsContainer } from '../containers/practice-agenda-groups.container';
import { practiceAgendaGroupsPattern } from './practice-agenda-groups.paths';

/**
 * Groups, the resolved plan, and copying an agenda, for one session.
 *
 * Gated on `practice.manage` alone: the plan this reads carries the coach's
 * private notes, and splitting the roster into groups is a coach's decision,
 * not something a member attending the session has reason to see. The
 * backend re-authorizes every call regardless.
 */
export function getPracticeAgendaGroupsRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: practiceAgendaGroupsPattern(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: PracticeAgendaGroupsContainer,
      meta: {
        key: 'practice-agenda-groups',
        titleKey: I18N_KEYS.practiceAgendaGroups.title,
        permissions: [PERMISSIONS.practicesManage],
        requiresTeamContext: true,
        // Splitting a roster and copying a plan are writes a coach makes
        // while planning; an offline shell could only show a stale plan next
        // to controls that cannot work.
        offline: false,
        preload: false,
        featureFlag: null,
        // Session-scoped: a sidebar item cannot resolve which session to
        // open, so the entry point is the session detail screen.
        nav: null,
      },
    },
  ];
}
