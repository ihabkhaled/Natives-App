import { buildAuthUser, type AuthUser } from '@/modules/auth';
import { PERMISSIONS } from '@/shared/security';

import { MOCK_INVITATION, MOCK_PERSONA_EMAILS } from './mock-data.constants';

const COACH_PERMISSIONS = [
  PERMISSIONS.memberList,
  PERMISSIONS.memberList,
  PERMISSIONS.memberProfileReadPublic,
  PERMISSIONS.memberProfileReadCoach,
  PERMISSIONS.memberProfileUpdateSelf,
  PERMISSIONS.memberRolesManage,
  PERMISSIONS.memberAliasesManage,
  PERMISSIONS.practicesRead,
  PERMISSIONS.practicesManage,
  PERMISSIONS.practicesRsvpSelf,
  PERMISSIONS.attendanceMark,
  // The Coach bundle extends Member with team capture: read.team, record and
  // finalize — deliberately NOT attendance.correct (Team Admin only).
  PERMISSIONS.attendanceReadSelf,
  PERMISSIONS.attendanceReadTeam,
  PERMISSIONS.attendanceFinalize,
  PERMISSIONS.analyticsReadSelf,
  PERMISSIONS.assessmentReview,
  PERMISSIONS.assessmentReadTeam,
  PERMISSIONS.assessmentReadSelfPublished,
  PERMISSIONS.assessmentCreate,
  PERMISSIONS.assessmentReview,
  PERMISSIONS.assessmentPublish,
  PERMISSIONS.feedbackReadSelf,
  PERMISSIONS.feedbackManage,
  PERMISSIONS.leaderboardsRead,
  PERMISSIONS.activityReadSelf,
  PERMISSIONS.activitySubmitSelf,
  PERMISSIONS.activityReview,
  PERMISSIONS.activityCorrect,
  PERMISSIONS.pointsReadSelf,
  PERMISSIONS.pointsReadTeam,
  PERMISSIONS.competitionRead,
  PERMISSIONS.competitionManage,
  PERMISSIONS.squadRead,
  PERMISSIONS.squadManage,
  PERMISSIONS.rosterRead,
  PERMISSIONS.rosterManage,
  PERMISSIONS.tryoutManage,
  PERMISSIONS.tryoutEvaluate,
  PERMISSIONS.matchRead,
  PERMISSIONS.matchScore,
  PERMISSIONS.matchFinalize,
  PERMISSIONS.matchStatsRead,
  PERMISSIONS.matchAnalysisReadTeam,
  // A coach reads the team configuration but never changes it: the read-only
  // settings path is a real persona, not a test-only contrivance.
  PERMISSIONS.settingsRead,
];

/**
 * A team administrator: everything inside one team, and nothing at the platform
 * level. The distinction is not cosmetic — `/teams` (browse-all) and creating a
 * team are platform routes that answer 403 for this persona, and the shell has
 * to agree with that rather than offering controls the server refuses.
 */
const TEAM_ADMIN_PERMISSIONS = [
  ...COACH_PERMISSIONS,
  PERMISSIONS.memberInvite,
  PERMISSIONS.memberLifecycleManage,
  PERMISSIONS.attendanceCorrect,
  PERMISSIONS.teamRead,
  PERMISSIONS.settingsManage,
  PERMISSIONS.seasonManage,
];

const MEMBER_PERMISSIONS = [
  PERMISSIONS.memberList,
  PERMISSIONS.memberList,
  PERMISSIONS.memberProfileReadPublic,
  PERMISSIONS.memberProfileUpdateSelf,
  PERMISSIONS.practicesRead,
  PERMISSIONS.practicesRsvpSelf,
  PERMISSIONS.attendanceReadSelf,
  PERMISSIONS.analyticsReadSelf,
  PERMISSIONS.assessmentReadSelfPublished,
  PERMISSIONS.feedbackReadSelf,
  PERMISSIONS.leaderboardsRead,
  PERMISSIONS.activityReadSelf,
  PERMISSIONS.activitySubmitSelf,
  PERMISSIONS.pointsReadSelf,
  PERMISSIONS.competitionRead,
  PERMISSIONS.squadRead,
  PERMISSIONS.rosterRead,
  // A member reads the scoreboard but neither scores it nor reads the
  // derived statistics: both read-only and forbidden are real personas.
  PERMISSIONS.matchRead,
];

/**
 * An analyst holds team-wide reads and NO self grants: no attendance.read.self,
 * no analytics.read.self, no activity/feedback self scopes. The persona exists
 * to pin that self-service surfaces stay hidden and answer 403, never a
 * loading mask (prompt 240 authorization matrix).
 */
const ANALYST_PERMISSIONS = [
  PERMISSIONS.memberList,
  PERMISSIONS.memberProfileReadPublic,
  PERMISSIONS.practicesRead,
  PERMISSIONS.attendanceReadTeam,
  PERMISSIONS.assessmentReadTeam,
  PERMISSIONS.pointsReadTeam,
  PERMISSIONS.matchRead,
  PERMISSIONS.matchStatsRead,
  PERMISSIONS.matchAnalysisReadTeam,
];

export const ADMIN_PERSONA = buildAuthUser();
const INVITED_PERSONA = buildAuthUser({
  id: 'user-invited',
  email: MOCK_INVITATION.email,
  displayName: 'Invited Ranger',
  permissions: MEMBER_PERMISSIONS,
});

/** Deterministic persona directory keyed by login email. */

export const PERSONA_USERS: Record<string, AuthUser> = {
  [MOCK_PERSONA_EMAILS.admin]: ADMIN_PERSONA,
  [MOCK_PERSONA_EMAILS.teamAdmin]: buildAuthUser({
    id: 'user-team-admin',
    email: MOCK_PERSONA_EMAILS.teamAdmin,
    displayName: 'Team Admin Tarek',
    permissions: TEAM_ADMIN_PERMISSIONS,
  }),
  [MOCK_PERSONA_EMAILS.coach]: buildAuthUser({
    id: 'user-coach',
    email: MOCK_PERSONA_EMAILS.coach,
    displayName: 'Coach Nadia',
    permissions: COACH_PERMISSIONS,
  }),
  [MOCK_PERSONA_EMAILS.member]: buildAuthUser({
    id: 'user-member',
    email: MOCK_PERSONA_EMAILS.member,
    displayName: 'Member Omar',
    permissions: MEMBER_PERMISSIONS,
  }),
  [MOCK_PERSONA_EMAILS.analyst]: buildAuthUser({
    id: 'user-analyst',
    email: MOCK_PERSONA_EMAILS.analyst,
    displayName: 'Analyst Rana',
    permissions: ANALYST_PERMISSIONS,
  }),
  [MOCK_PERSONA_EMAILS.pending]: buildAuthUser({
    id: 'user-pending',
    email: MOCK_PERSONA_EMAILS.pending,
    displayName: 'Pending Sara',
    permissions: MEMBER_PERMISSIONS,
    onboardingComplete: false,
  }),
  [MOCK_PERSONA_EMAILS.suspended]: buildAuthUser({
    id: 'user-suspended',
    email: MOCK_PERSONA_EMAILS.suspended,
    displayName: 'Suspended Ali',
    permissions: MEMBER_PERMISSIONS,
    accountState: 'suspended',
  }),
  [MOCK_PERSONA_EMAILS.noTeam]: buildAuthUser({
    id: 'user-noteam',
    email: MOCK_PERSONA_EMAILS.noTeam,
    displayName: 'Newcomer Lina',
    permissions: MEMBER_PERMISSIONS,
    memberships: [],
  }),
  [MOCK_INVITATION.email]: INVITED_PERSONA,
};
