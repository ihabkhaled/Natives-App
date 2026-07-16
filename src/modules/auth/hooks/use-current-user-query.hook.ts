import { useAppQuery } from '@/packages/query';

import { buildCurrentUserQueryOptions } from '../queries/current-user.query';
import type { AuthUser } from '../types/auth.types';

export interface CurrentUserQueryView {
  readonly user: AuthUser | undefined;
  readonly isLoading: boolean;
  readonly isError: boolean;
}

export function useCurrentUserQuery(): CurrentUserQueryView {
  const query = useAppQuery<AuthUser>(buildCurrentUserQueryOptions());
  return {
    user: query.data,
    isLoading: query.isPending,
    isError: query.isError,
  };
}
