import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { AttendanceContainer } from '../containers/attendance.container';
import { attendancePattern } from './attendance.paths';

export function getAttendanceRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
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
        nav: null,
      },
    },
  ];
}
