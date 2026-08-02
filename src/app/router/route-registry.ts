import { getAdminRouteDefinitions } from '@/modules/admin';
import { getAnalyticsRouteDefinitions } from '@/modules/analytics';
import { getAssessmentsRouteDefinitions } from '@/modules/assessments';
import { getAttendanceRouteDefinitions } from '@/modules/attendance';
import { getAuthRouteDefinitions } from '@/modules/auth';
import { getCompetitionsRouteDefinitions } from '@/modules/competitions';
import { getContactRouteDefinitions } from '@/modules/contact';
import { getHomeRouteDefinitions, getNotFoundRouteDefinition } from '@/modules/home';
import { getMatchesRouteDefinitions } from '@/modules/matches';
import { getMembersRouteDefinitions } from '@/modules/members';
import { getNotificationsRouteDefinitions } from '@/modules/notifications';
import { getPointsRouteDefinitions } from '@/modules/points';
import { getPracticeRouteDefinitions } from '@/modules/practice';
import { getPublicCompetitionsRouteDefinitions } from '@/modules/public-competitions';
import { getReportsRouteDefinitions } from '@/modules/reports';
import { getSettingsRouteDefinitions } from '@/modules/settings';
import { getStandingsRouteDefinitions } from '@/modules/standings';
import { getTeamsRouteDefinitions } from '@/modules/teams';
import { getTrainingRouteDefinitions } from '@/modules/training';
import { getTryoutsRouteDefinitions } from '@/modules/tryouts';
import { getWorkbenchRouteDefinitions } from '@/modules/ui-workbench';
import type { AppRouteDefinition } from '@/shared/types';

/** Ordered route table; the catch-all not-found route must stay last. */
export function getAppRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    ...getAuthRouteDefinitions(),
    ...getHomeRouteDefinitions(),
    ...getContactRouteDefinitions(),
    ...getPublicCompetitionsRouteDefinitions(),
    ...getPracticeRouteDefinitions(),
    ...getAttendanceRouteDefinitions(),
    ...getMembersRouteDefinitions(),
    ...getAssessmentsRouteDefinitions(),
    ...getTrainingRouteDefinitions(),
    ...getPointsRouteDefinitions(),
    ...getStandingsRouteDefinitions(),
    ...getAnalyticsRouteDefinitions(),
    ...getReportsRouteDefinitions(),
    ...getCompetitionsRouteDefinitions(),
    ...getMatchesRouteDefinitions(),
    ...getTryoutsRouteDefinitions(),
    ...getNotificationsRouteDefinitions(),
    ...getAdminRouteDefinitions(),
    ...getTeamsRouteDefinitions(),
    ...getSettingsRouteDefinitions(),
    ...getWorkbenchRouteDefinitions(),
  ];
}

export function getCatchAllRouteDefinition(): AppRouteDefinition {
  return getNotFoundRouteDefinition();
}
