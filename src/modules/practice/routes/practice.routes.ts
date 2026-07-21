import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { PracticeCalendarContainer } from '../containers/practice-calendar.container';
import { PracticeSessionDetailsContainer } from '../containers/practice-session-details.container';
import { practicesPath, practiceSessionPattern } from './practice.paths';

/**
 * Practice calendar and session-detail routes. Both are gated on the
 * `practice.read` permission; the guard blocks a direct URL for any persona
 * without that grant. The backend re-authorises every read regardless.
 *
 * The string must match the backend catalog exactly. It once read
 * `practices.read`, which the backend never emits, so the guard forbade both
 * screens for every persona — including a full administrator — while the
 * endpoints behind them answered 200. See
 * tests/contract/permissions.contract.test.ts.
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
        requiresTeamContext: true,
        offline: true,
        preload: false,
        featureFlag: null,
        nav: {
          order: 10,
          group: NAV_GROUP.Team,
          iconName: 'calendar',
          labelKey: I18N_KEYS.practice.calendarTitle,
        },
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
        requiresTeamContext: true,
        offline: true,
        preload: false,
        featureFlag: null,
        nav: null,
      },
    },
  ];
}
