import { useCurrentUserQuery } from '@/modules/auth';

export interface PracticeTeamContextView {
  readonly teamId: string;
  readonly isLoading: boolean;
  readonly isError: boolean;
}

/**
 * The team scope used by team-scoped practice endpoints. Until the product
 * exposes a team switcher, the first authenticated membership is the active
 * membership already used by the route guard's team-context decision.
 */
export function usePracticeTeamContext(): PracticeTeamContextView {
  const currentUser = useCurrentUserQuery();
  return {
    teamId: currentUser.user?.memberships[0]?.teamId ?? '',
    isLoading: currentUser.isLoading,
    isError: currentUser.isError,
  };
}
