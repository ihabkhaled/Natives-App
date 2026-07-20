import { useCurrentUserQuery } from '@/modules/auth';

export interface AssessmentsTeamContextView {
  readonly teamId: string;
  readonly isLoading: boolean;
  readonly isError: boolean;
}

/** The signed-in principal first team; every cache key is scoped to it. */
export function useAssessmentsTeamContext(): AssessmentsTeamContextView {
  const currentUser = useCurrentUserQuery();
  return {
    teamId: currentUser.user?.memberships[0]?.teamId ?? '',
    isLoading: currentUser.isLoading,
    isError: currentUser.isError,
  };
}
