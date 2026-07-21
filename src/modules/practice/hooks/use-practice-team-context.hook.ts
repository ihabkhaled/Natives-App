import { useActiveTeamScope } from '@/modules/auth';

export interface PracticeTeamContextView {
  readonly teamId: string;
  readonly isLoading: boolean;
  readonly isError: boolean;
}

/**
 * The team scope this module works inside. Resolved by the shared
 * active-team scope so a multi-team principal follows the team they switched
 * to, instead of whichever membership the identity endpoint happened to list
 * first.
 */
export function usePracticeTeamContext(): PracticeTeamContextView {
  const scope = useActiveTeamScope();
  return { teamId: scope.teamId, isLoading: scope.isLoading, isError: scope.isError };
}
