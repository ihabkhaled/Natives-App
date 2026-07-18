import { useAppQuery } from '@/packages/query';
import { type AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { buildSessionsQueryOptions } from '../queries/sessions.query';
import type { DeviceSession } from '../types/auth.types';

export interface SessionsQueryView {
  readonly sessions: readonly DeviceSession[];
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly refetch: () => void;
}

/** Loads the account's active device sessions for the session-management screen. */
export function useSessionsQuery(): SessionsQueryView {
  const query = useAppQuery<readonly DeviceSession[]>(buildSessionsQueryOptions());
  return {
    sessions: query.data ?? [],
    isLoading: query.isPending,
    error: query.error === null ? null : toAppError(query.error),
    refetch: () => {
      void query.refetch();
    },
  };
}
