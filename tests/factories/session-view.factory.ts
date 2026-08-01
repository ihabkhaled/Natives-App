import type { SessionView } from '@/modules/auth';
import { SESSION_STATUS } from '@/modules/auth';

/** Deterministic session view for hooks that only branch on resolution + auth state. */
export function buildSessionView(overrides: Partial<SessionView> = {}): SessionView {
  return {
    status: SESSION_STATUS.Anonymous,
    isAuthenticated: false,
    isResolved: true,
    ...overrides,
  };
}
