import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition, type RouteMeta } from '@/shared/types';

import { PracticeScheduleDetailContainer } from '../containers/practice-schedule-detail.container';
import { PracticeSchedulesListContainer } from '../containers/practice-schedules-list.container';
import {
  practiceScheduleDetailPattern,
  practiceScheduleNewPath,
  practiceSchedulesPath,
} from './practice-schedules.paths';

/**
 * Every schedules route is `practice.manage`, the same grant reminders uses:
 * the recurring pattern behind a session is a coach's configuration, not
 * roster information a member reads. The backend re-authorizes every call
 * regardless.
 */
function baseMeta(key: string): Omit<RouteMeta, 'titleKey' | 'nav'> {
  return {
    key,
    permissions: [PERMISSIONS.practicesManage],
    requiresTeamContext: true,
    // Every screen here reads or writes a live pattern; an offline shell could
    // only show a stale copy beside controls that cannot work.
    offline: false,
    preload: false,
    featureFlag: null,
  };
}

/**
 * Recurring practice patterns: list, create, edit, delete, and generate real
 * sessions from one.
 *
 * ORDER MATTERS. The literal `/practice-schedules/new` is declared before
 * `/practice-schedules/:scheduleId` because the router renders the FIRST
 * matching Route: with the pattern first, opening "new" would match
 * `scheduleId = "new"` and try to load a schedule that does not exist.
 * `app-paths.constants.test.ts` and `deep-link-policy.constants.test.ts` pin
 * that ordering too.
 */
export function getPracticeSchedulesRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: practiceSchedulesPath(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: PracticeSchedulesListContainer,
      meta: {
        ...baseMeta('practice-schedules'),
        titleKey: I18N_KEYS.practiceSchedules.title,
        nav: {
          order: 46,
          group: NAV_GROUP.Manage,
          iconName: 'calendar',
          labelKey: I18N_KEYS.practiceSchedules.navLabel,
        },
      },
    },
    {
      path: practiceScheduleNewPath(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: PracticeScheduleDetailContainer,
      meta: {
        ...baseMeta('practice-schedule-new'),
        titleKey: I18N_KEYS.practiceSchedules.createTitle,
        nav: null,
      },
    },
    {
      path: practiceScheduleDetailPattern(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: PracticeScheduleDetailContainer,
      meta: {
        ...baseMeta('practice-schedule-detail'),
        titleKey: I18N_KEYS.practiceSchedules.detailTitle,
        nav: null,
      },
    },
  ];
}
