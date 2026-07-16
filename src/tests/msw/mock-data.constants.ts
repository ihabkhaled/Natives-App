/** Deterministic mock-mode dataset shared by dev, Vitest, and Playwright. */
export const MOCK_CREDENTIALS = {
  email: 'ranger@example.com',
  password: 'Ranger#1234',
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
