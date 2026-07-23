import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { AttendanceContainer } from '../containers/attendance.container';
import { MyAttendanceContainer } from '../containers/my-attendance.container';
import { attendancePattern, myAttendancePath } from './attendance.paths';

function coachCaptureRoute(): AppRouteDefinition {
  return {
    path: attendancePattern(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: AttendanceContainer,
    meta: {
      key: 'coach-attendance',
      titleKey: I18N_KEYS.attendance.title,
      permissions: [PERMISSIONS.attendanceMark],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      // Session-scoped: a bare nav item cannot resolve a session, so
      // discoverability is the session-detail CTA plus widget deep links (D6).
      nav: null,
    },
  };
}

function myAttendanceRoute(): AppRouteDefinition {
  return {
    path: myAttendancePath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: MyAttendanceContainer,
    meta: {
      key: 'my-attendance',
      titleKey: I18N_KEYS.attendance.selfTitle,
      permissions: [PERMISSIONS.attendanceReadSelf],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      // Order 12: directly under Practice calendar (10), before Assessments
      // (20) — the member cluster from the persona navigation matrix.
      nav: {
        order: 12,
        group: NAV_GROUP.Team,
        iconName: 'checkmark',
        labelKey: I18N_KEYS.attendance.selfNavLabel,
      },
    },
  };
}

/**
 * The coach capture screen (attendance.record) and the member self screen
 * (attendance.read.self). An analyst or scorekeeper holds neither self grant,
 * so neither sees "My attendance"; the guard also blocks their direct URL.
 */
export function getAttendanceRouteDefinitions(): readonly AppRouteDefinition[] {
  return [coachCaptureRoute(), myAttendanceRoute()];
}
