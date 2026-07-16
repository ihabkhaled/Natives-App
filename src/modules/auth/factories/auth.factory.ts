import type { AuthUser } from '../types/auth.types';

/** Deterministic builders shared by MSW handlers and tests. */
export function buildAuthUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'user-1',
    email: 'ranger@example.com',
    displayName: 'Ranger One',
    ...overrides,
  };
}
