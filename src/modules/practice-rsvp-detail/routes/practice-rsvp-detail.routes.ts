import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { PracticeRsvpDetailContainer } from '../containers/practice-rsvp-detail.container';
import { practiceRsvpDetailPattern } from './practice-rsvp-detail.paths';

/**
 * Who is coming to one session, the summary counts, and the override/history
 * tools for one member — for one session.
 *
 * Gated on `practice.manage`, the same grant `practice-reminders` uses: who
 * is coming is roster information, and changing an answer on somebody's
 * behalf is a coach's action. The backend re-authorizes every call regardless.
 */
export function getPracticeRsvpDetailRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: practiceRsvpDetailPattern(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: PracticeRsvpDetailContainer,
      meta: {
        key: 'practice-rsvp-detail',
        titleKey: I18N_KEYS.practiceRsvpDetail.title,
        permissions: [PERMISSIONS.practicesManage],
        requiresTeamContext: true,
        // An override is a write against a live record; an offline shell
        // could only show a stale roster beside controls that cannot work.
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
