import type { AssessmentsTeamContextView } from '@/modules/assessments/hooks/use-assessments-team-context.hook';

interface PermissionsStub {
  readonly permissions: readonly string[];
  readonly accountActive: boolean;
  readonly onboardingComplete: boolean;
  readonly hasTeamContext: boolean;
  readonly isLoading: boolean;
  readonly isError: boolean;
}

/** A resolved principal holding exactly the given grants. */
export function stubPermissions(permissions: readonly string[]): PermissionsStub {
  return {
    permissions,
    accountActive: true,
    onboardingComplete: true,
    hasTeamContext: true,
    isLoading: false,
    isError: false,
  };
}

/** A resolved team scope for the assessment screen hooks. */
export function stubTeamContext(): AssessmentsTeamContextView {
  return { teamId: 'team-natives', isLoading: false, isError: false };
}
