import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { PracticeAgendaContainer } from '../containers/practice-agenda.container';
import { practiceAgendaPattern } from './practice-agenda.paths';

/**
 * One session's plan. The route is gated on `practice.read` rather than
 * `practice.manage`: a member may legitimately read the agenda of a session
 * they are attending, and the screen withholds the editing affordances from
 * anyone who does not also hold the manage grant.
 */
export function getPracticeAgendaRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: practiceAgendaPattern(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: PracticeAgendaContainer,
      meta: {
        key: 'practice-agenda',
        titleKey: I18N_KEYS.practiceAgenda.title,
        permissions: [PERMISSIONS.practicesRead],
        requiresTeamContext: true,
        offline: true,
        preload: false,
        featureFlag: null,
        // Session-scoped: a bare nav item cannot resolve which session's plan
        // to open, so discoverability is the session-detail entry point rather
        // than a sidebar destination.
        nav: null,
      },
    },
  ];
}
