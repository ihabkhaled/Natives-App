import { SESSION_STATUS, type SessionStatus } from '../types/auth.types';
import { useSessionStore } from '../store/session.store';

export interface SessionView {
  readonly status: SessionStatus;
  readonly isAuthenticated: boolean;
  readonly isResolved: boolean;
}

/** Session status for guards and screens; never exposes tokens. */
export function useSession(): SessionView {
  const status = useSessionStore((state) => state.status);
  return {
    status,
    isAuthenticated: status === SESSION_STATUS.Authenticated,
    isResolved: status !== SESSION_STATUS.Unknown,
  };
}
