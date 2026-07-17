import { createAppStore } from '@/packages/state';

import { SESSION_STATUS, type SessionStatus } from '../types/auth.types';

export interface SessionState {
  readonly status: SessionStatus;
  readonly markAuthenticated: () => void;
  readonly markAnonymous: () => void;
}

/**
 * Client-side session snapshot only: authentication STATUS, never profile
 * data (that belongs to TanStack Query) and never tokens (secure storage).
 */
export const useSessionStore = createAppStore<SessionState>((set) => ({
  status: SESSION_STATUS.Unknown,
  markAuthenticated: () => {
    set({ status: SESSION_STATUS.Authenticated });
  },
  markAnonymous: () => {
    set({ status: SESSION_STATUS.Anonymous });
  },
}));
