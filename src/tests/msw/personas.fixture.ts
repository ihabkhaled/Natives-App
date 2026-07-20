import { buildAuthUser, type AuthUser } from '@/modules/auth';
import { PERMISSIONS } from '@/shared/security';

import { MOCK_INVITATION, MOCK_PERSONA_EMAILS } from './mock-data.constants';

const COACH_PERMISSIONS = [
  PERMISSIONS.membersRead,
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
  PERMISSIONS.assessmentsManage,
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
];

const MEMBER_PERMISSIONS = [
  PERMISSIONS.membersRead,
  PERMISSIONS.memberList,
  PERMISSIONS.memberProfileReadPublic,
  PERMISSIONS.memberProfileUpdateSelf,
  PERMISSIONS.practicesRead,
  PERMISSIONS.practicesRsvpSelf,
  PERMISSIONS.assessmentReadSelfPublished,
  PERMISSIONS.feedbackReadSelf,
  PERMISSIONS.leaderboardsRead,
  PERMISSIONS.activityReadSelf,
  PERMISSIONS.activitySubmitSelf,
  PERMISSIONS.pointsReadSelf,
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
