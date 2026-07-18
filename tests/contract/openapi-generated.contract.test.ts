import { describe, expect, it } from 'vitest';

import {
  authUserDtoSchema,
  loginResponseSchema,
  logoutResponseSchema,
  refreshResponseSchema,
} from '@/modules/auth';
import {
  practiceRsvpResponseSchema,
  practiceSessionListResponseSchema,
  practiceSessionResponseSchema,
} from '@/modules/practice';
import type {
  CurrentUserResponseContract,
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
