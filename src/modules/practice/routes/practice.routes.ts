import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { PracticeCalendarContainer } from '../containers/practice-calendar.container';
import { PracticeSessionDetailsContainer } from '../containers/practice-session-details.container';
import { practicesPath, practiceSessionPattern } from './practice.paths';

/**
 * Practice calendar and session-detail routes. Both are gated on the
 * practices.read permission; the guard blocks a direct URL for any persona
 * without that grant. The backend re-authorises every read regardless.
 */
export function getPracticeRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: practicesPath(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: PracticeCalendarContainer,
      meta: {
        key: 'practice-calendar',
        titleKey: I18N_KEYS.practice.calendarTitle,
        permissions: [PERMISSIONS.practicesRead],
        requiresTeamContext: false,
        offline: true,
        preload: false,
        featureFlag: null,
        nav: null,
      },
    },
    {
      path: practiceSessionPattern(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: PracticeSessionDetailsContainer,
      meta: {
        key: 'practice-session',
        titleKey: I18N_KEYS.practice.calendarTitle,
        permissions: [PERMISSIONS.practicesRead],
        requiresTeamContext: false,
        offline: true,
        preload: false,
        featureFlag: null,
        nav: null,
      },
    },
  ];
}
