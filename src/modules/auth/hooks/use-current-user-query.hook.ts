import { useAppQuery } from '@/packages/query';

import { buildCurrentUserQueryOptions } from '../queries/current-user.query';
import type { AuthUser } from '../types/auth.types';

export interface CurrentUserQueryOptions {
  /** Disable the fetch while the session is anonymous (avoids a stray 401). */
  readonly enabled?: boolean;
}

export interface CurrentUserQueryView {
  readonly user: AuthUser | undefined;
  readonly isLoading: boolean;
  readonly isError: boolean;
}

export function useCurrentUserQuery(options: CurrentUserQueryOptions = {}): CurrentUserQueryView {
  const query = useAppQuery<AuthUser>({
    ...buildCurrentUserQueryOptions(),
    enabled: options.enabled ?? true,
  });
  return {
    user: query.data,
    isLoading: query.isPending,
    isError: query.isError,
  };
}
