import { describe, expect, it } from 'vitest';

import {
  authMembershipDtoSchema,
  authUserDtoSchema,
  loginResponseSchema,
  logoutResponseSchema,
  refreshResponseSchema,
} from '@/modules/auth';
import { dashboardSummaryResponseSchema } from '@/modules/dashboard';
import { memberRolesResponseSchema } from '@/modules/members';
import { leaderboardResponseSchema, pointsSummaryResponseSchema } from '@/modules/points';
import { activityTypeListResponseSchema } from '@/modules/training';
import {
  practiceRsvpResponseSchema,
  practiceSessionListResponseSchema,
  practiceSessionResponseSchema,
} from '@/modules/practice';
import type {
  ActivityTypeListContract,
  AuthMembershipContract,
  CurrentUserResponseContract,
  DashboardSummaryContract,
  LeaderboardContract,
  MemberRolesContract,
  PointsSummaryContract,
  LoginResponseContract,
  MessageResponseContract,
  PracticeRsvpContract,
  PracticeSessionContract,
  PracticeSessionListContract,
  RefreshResponseContract,
} from '@/packages/api-contract';
import { safeParseWithSchema } from '@/packages/schema';

const loginResponse: LoginResponseContract = {
  tokens: {
    accessToken: 'synthetic-access',
    refreshToken: 'synthetic-refresh',
  },
  user: {
    accountState: 'active',
    displayName: 'Synthetic Player',
    email: 'synthetic@example.com',
    id: '00000000-0000-4000-8000-000000000001',
    memberships: [],
    onboardingComplete: true,
    permissions: ['practice.read'],
  },
};

const refreshResponse: RefreshResponseContract = {
  accessToken: 'synthetic-access-rotated',
  refreshToken: 'synthetic-refresh-rotated',
  refreshTokenExpiresAt: '2026-08-18T12:00:00.000Z',
  userId: '00000000-0000-4000-8000-000000000001',
};

const logoutResponse: MessageResponseContract = {
  message: 'identity.session.revoked',
};

const currentUserResponse: CurrentUserResponseContract = loginResponse.user;

const practiceSession: PracticeSessionContract = {
  cancellationReason: null,
  capacity: 24,
  createdAt: '2026-07-18T09:00:00.000Z',
  createdBy: null,
  endsAt: '2026-07-26T17:00:00.000Z',
  field: null,
  id: 'session-1',
  meetAt: null,
  notes: null,
  occurrenceDate: '2026-07-26',
  organizerUserId: null,
  rsvpCutoffAt: null,
  scheduleId: null,
  seasonId: null,
  sessionType: 'practice',
  startsAt: '2026-07-26T15:00:00.000Z',
  status: 'published',
  teamId: 'team-1',
  timezone: 'Africa/Cairo',
  updatedAt: '2026-07-18T09:00:00.000Z',
  updatedBy: null,
  venueId: null,
  version: 1,
  visibility: 'team',
};

const practiceRsvp: PracticeRsvpContract = {
  membershipId: 'membership-1',
  sessionId: practiceSession.id,
  status: 'no_response',
  reasonCategory: null,
  note: null,
  noteVisibility: null,
  respondedAt: null,
  source: null,
  version: null,
  waitlisted: false,
};

const practiceList: PracticeSessionListContract = {
  items: [practiceSession],
  limit: 20,
  offset: 0,
  total: 1,
};

describe('generated backend contract', () => {
  it('keeps the login runtime schema compatible with generated types', () => {
    expect(safeParseWithSchema(loginResponseSchema, loginResponse).success).toBe(true);
    expect(safeParseWithSchema(authUserDtoSchema, currentUserResponse).success).toBe(true);
  });

  it('keeps the refresh runtime schema compatible with generated types', () => {
    expect(safeParseWithSchema(refreshResponseSchema, refreshResponse).success).toBe(true);
  });

  it('keeps the logout runtime schema compatible with generated types', () => {
    expect(safeParseWithSchema(logoutResponseSchema, logoutResponse).success).toBe(true);
  });

  it('keeps practice runtime schemas compatible with generated types', () => {
    expect(safeParseWithSchema(practiceSessionResponseSchema, practiceSession).success).toBe(true);
    expect(safeParseWithSchema(practiceSessionListResponseSchema, practiceList).success).toBe(true);
    expect(safeParseWithSchema(practiceRsvpResponseSchema, practiceRsvp).success).toBe(true);
  });
});

const authMembership: AuthMembershipContract = {
  membershipId: '00000000-0000-4000-8000-00000000a001',
  teamId: '00000000-0000-4000-8000-00000000b001',
  teamSlug: 'cairo-natives',
  teamName: 'Cairo Natives',
  seasonId: null,
  seasonSlug: null,
  seasonName: null,
  status: 'active',
  roles: ['member'],
};

const dashboardSummary: DashboardSummaryContract = {
  persona: 'member',
  generatedAt: '2026-07-18T09:00:00.000Z',
  widgets: [{ kind: 'member-standing', presentation: 'metric', status: 'unavailable', asOf: null }],
};

const memberRoles: MemberRolesContract = {
  membershipId: '00000000-0000-4000-8000-00000000a001',
  roles: ['member'],
  assignableRoles: ['member', 'coach'],
};

const leaderboard: LeaderboardContract = {
  items: [
    {
      membershipId: '00000000-0000-4000-8000-00000000a001',
      status: 'active',
      total: 0,
      rank: 4,
      previousRank: null,
      rankDelta: null,
      movement: 'none',
      badgeCount: 0,
      contributions: [],
    },
  ],
  total: 1,
  limit: 50,
  offset: 0,
  period: 'season',
  tieMode: 'competition',
  cohort: 'all',
  category: null,
  asOf: '2026-07-13T06:00:00.000Z',
};

const pointsSummary: PointsSummaryContract = {
  membershipId: '00000000-0000-4000-8000-00000000a001',
  total: 0,
  entries: [],
  badges: [],
};

const activityTypes: ActivityTypeListContract = {
  items: [
    {
      id: '00000000-0000-4000-8000-00000000c001',
      typeKey: 'wfdf-accreditation',
      name: 'WFDF accreditation module',
      description: 'Officiating module.',
      category: 'accreditation',
      unit: null,
      defaultPointValue: null,
      pointsApproval: 'pending',
      requiresEvidence: true,
      minDurationMinutes: null,
      maxDurationMinutes: null,
      catalogVersion: 3,
    },
  ],
  total: 1,
  limit: 100,
  offset: 0,
};

describe('generated contract for the newly landed endpoints', () => {
  it('accepts a membership on a team that has no season', () => {
    expect(safeParseWithSchema(authMembershipDtoSchema, authMembership).success).toBe(true);
  });

  it('accepts a dashboard widget that carries no payload at all', () => {
    expect(safeParseWithSchema(dashboardSummaryResponseSchema, dashboardSummary).success).toBe(
      true,
    );
  });

  it('keeps the member-roles runtime schema compatible with generated types', () => {
    expect(safeParseWithSchema(memberRolesResponseSchema, memberRoles).success).toBe(true);
  });

  it('keeps the points runtime schemas compatible with generated types', () => {
    expect(safeParseWithSchema(leaderboardResponseSchema, leaderboard).success).toBe(true);
    expect(safeParseWithSchema(pointsSummaryResponseSchema, pointsSummary).success).toBe(true);
  });

  it('keeps the activities runtime schema compatible with generated types', () => {
    expect(safeParseWithSchema(activityTypeListResponseSchema, activityTypes).success).toBe(true);
  });
});
