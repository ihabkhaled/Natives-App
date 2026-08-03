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
import { getNewsRouteDefinitions } from '@/modules/news';
import { getNotificationsRouteDefinitions } from '@/modules/notifications';
import { getPointsRouteDefinitions } from '@/modules/points';
import { getPracticeRouteDefinitions } from '@/modules/practice';
import { getPublicCompetitionsRouteDefinitions } from '@/modules/public-competitions';
import { getDataQualityRouteDefinitions } from '@/modules/data-quality';
import { getGovernanceRouteDefinitions } from '@/modules/governance';
import { getJerseyRouteDefinitions } from '@/modules/jersey';
import { getPracticeAgendaRouteDefinitions } from '@/modules/practice-agenda';
import { getRoleAssignmentsRouteDefinitions } from '@/modules/role-assignments';
import { getTryoutCandidatesRouteDefinitions } from '@/modules/tryout-candidates';
import { getReportsRouteDefinitions } from '@/modules/reports';
import { getSettingsRouteDefinitions } from '@/modules/settings';
import { getStandingsRouteDefinitions } from '@/modules/standings';
import { getTeamDirectoryRouteDefinitions } from '@/modules/team-directory';
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
    ...getTeamDirectoryRouteDefinitions(),
    ...getPublicCompetitionsRouteDefinitions(),
    ...getNewsRouteDefinitions(),
    ...getPracticeRouteDefinitions(),
    ...getAttendanceRouteDefinitions(),
    ...getMembersRouteDefinitions(),
    ...getAssessmentsRouteDefinitions(),
    ...getTrainingRouteDefinitions(),
    ...getPointsRouteDefinitions(),
    ...getStandingsRouteDefinitions(),
    ...getAnalyticsRouteDefinitions(),
    ...getDataQualityRouteDefinitions(),
    ...getGovernanceRouteDefinitions(),
    ...getJerseyRouteDefinitions(),
    ...getPracticeAgendaRouteDefinitions(),
    ...getRoleAssignmentsRouteDefinitions(),
    ...getTryoutCandidatesRouteDefinitions(),
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
