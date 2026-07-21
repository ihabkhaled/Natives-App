/** Deterministic mock-mode dataset shared by dev, Vitest, and Playwright. */
export const MOCK_CREDENTIALS = {
  email: 'ranger@example.com',
  password: 'Ranger#1234',
} as const;

/**
 * Persona logins. Every persona shares MOCK_CREDENTIALS.password; the email
 * selects the effective permissions, account state, and team scope so the
 * shell can be exercised for admins, coaches, members, and edge accounts.
 */
export const MOCK_PERSONA_EMAILS = {
  admin: MOCK_CREDENTIALS.email,
  teamAdmin: 'team-admin@example.com',
  coach: 'coach@example.com',
  member: 'member@example.com',
  pending: 'pending@example.com',
  suspended: 'suspended@example.com',
  noTeam: 'newcomer@example.com',
} as const;

/** Special emails that trigger deterministic failure scenarios. */
export const MOCK_SCENARIO_EMAILS = {
  forbidden: 'locked@example.com',
  rateLimited: 'ratelimit@example.com',
  serverError: 'server@example.com',
  timeout: 'timeout@example.com',
} as const;

export const MOCK_TOKENS = {
  access: 'mock-access-token',
  refresh: 'mock-refresh-token',
  rotatedAccess: 'mock-access-token-rotated',
  rotatedRefresh: 'mock-refresh-token-rotated',
  rotatedRefreshExpiresAt: '2026-08-18T12:00:00.000Z',
  invitedAccess: 'mock-access-user-invited',
  invitedRefresh: 'mock-refresh-user-invited',
  invitedRefreshExpiresAt: '2026-08-18T12:00:00.000Z',
} as const;

export const MOCK_HEALTH = {
  version: '1.0.0-mock',
  timestamp: '2026-07-16T12:00:00.000Z',
} as const;

/** Canonical team-scoped practice contract identifiers. */
export const MOCK_PRACTICE = {
  teamId: 'team-natives',
  sessionId: 'sess-evening',
  conflictSessionId: 'sess-conflict',
  closedSessionId: 'sess-throwing',
} as const;

export const MOCK_ATTENDANCE = {
  teamId: MOCK_PRACTICE.teamId,
  sessionId: MOCK_PRACTICE.sessionId,
  presentMembershipId: '10000000-0000-4000-8000-000000000001',
  lateMembershipId: '10000000-0000-4000-8000-000000000002',
  conflictMembershipId: '10000000-0000-4000-8000-000000000003',
  historicalMembershipId: '10000000-0000-4000-8000-000000000004',
} as const;

/**
 * Invitation acceptance fixtures. Each token selects a deterministic lifecycle
 * state so invite lookup and acceptance can be exercised end to end.
 */
export const MOCK_INVITATION = {
  validToken: 'invite-valid-token',
  expiredToken: 'invite-expired-token',
  usedToken: 'invite-used-token',
  email: 'invitee@example.com',
  role: 'user',
  inviterName: null,
  expiresAt: '2026-08-01T12:00:00.000Z',
} as const;

/** Password-reset fixtures keyed by the token embedded in the reset link. */
export const MOCK_RESET = {
  validToken: 'reset-valid-token',
  expiredToken: 'reset-expired-token',
} as const;

/** A strong password that satisfies the set-password policy in mock flows. */
export const MOCK_STRONG_PASSWORD = 'Ranger#Strong1234';

/** Deterministic device/session directory for session management flows. */
export const MOCK_SESSIONS = [
  {
    id: 'session-current',
    device: 'Chrome on macOS',
    approxLocation: 'Cairo, EG',
    lastActiveAt: '2026-07-18T09:30:00.000Z',
    current: true,
  },
  {
    id: 'session-tablet',
    device: 'Safari on iPad',
    approxLocation: 'Alexandria, EG',
    lastActiveAt: '2026-07-17T18:05:00.000Z',
    current: false,
  },
  {
    id: 'session-phone',
    device: 'Ultimate Natives on Android',
    approxLocation: 'Cairo, EG',
    lastActiveAt: '2026-07-16T21:15:00.000Z',
    current: false,
  },
] as const;

export const MOCK_TIMEOUT_DELAY_MS = 60_000;
