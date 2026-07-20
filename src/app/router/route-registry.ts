import { getAdminRouteDefinitions } from '@/modules/admin';
import { getAssessmentsRouteDefinitions } from '@/modules/assessments';
import { getAttendanceRouteDefinitions } from '@/modules/attendance';
import { getAuthRouteDefinitions } from '@/modules/auth';
import { getHomeRouteDefinitions, getNotFoundRouteDefinition } from '@/modules/home';
import { getMembersRouteDefinitions } from '@/modules/members';
import { getPointsRouteDefinitions } from '@/modules/points';
import { getPracticeRouteDefinitions } from '@/modules/practice';
import { getSettingsRouteDefinitions } from '@/modules/settings';
import { getTrainingRouteDefinitions } from '@/modules/training';
import { getWorkbenchRouteDefinitions } from '@/modules/ui-workbench';
import type { AppRouteDefinition } from '@/shared/types';

/** Ordered route table; the catch-all not-found route must stay last. */
export function getAppRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    ...getAuthRouteDefinitions(),
    ...getHomeRouteDefinitions(),
    ...getPracticeRouteDefinitions(),
    ...getAttendanceRouteDefinitions(),
    ...getMembersRouteDefinitions(),
    ...getAssessmentsRouteDefinitions(),
    ...getTrainingRouteDefinitions(),
    ...getPointsRouteDefinitions(),
    ...getAdminRouteDefinitions(),
    ...getSettingsRouteDefinitions(),
    ...getWorkbenchRouteDefinitions(),
  ];
}

export function getCatchAllRouteDefinition(): AppRouteDefinition {
  return getNotFoundRouteDefinition();
}
