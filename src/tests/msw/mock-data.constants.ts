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
} as const;

export const MOCK_HEALTH = {
  version: '1.0.0-mock',
  timestamp: '2026-07-16T12:00:00.000Z',
} as const;

export const MOCK_TIMEOUT_DELAY_MS = 60_000;
