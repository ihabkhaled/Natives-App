import { ACCOUNT_STATE, type AuthUser } from '../types/auth.types';
import { useCurrentUserQuery } from './use-current-user-query.hook';
import { useSession } from './use-session.hook';

export interface EffectivePermissionsView {
  readonly permissions: readonly string[];
  readonly accountActive: boolean;
  readonly onboardingComplete: boolean;
  readonly hasTeamContext: boolean;
  readonly isLoading: boolean;
  readonly isError: boolean;
}

type EffectiveAuthContext = Omit<EffectivePermissionsView, 'isLoading' | 'isError'>;

function contextFromUser(user: AuthUser | undefined): EffectiveAuthContext {
  if (user === undefined) {
    return {
      permissions: [],
      accountActive: false,
      onboardingComplete: false,
      hasTeamContext: false,
    };
  }
  return {
    permissions: user.permissions,
    accountActive: user.accountState === ACCOUNT_STATE.Active,
    onboardingComplete: user.onboardingComplete,
    hasTeamContext: user.memberships.length > 0,
  };
}

/**
 * The authenticated session's effective authorization context. The profile
 * fetch is disabled while anonymous so public screens never trigger a 401.
 * Navigation and guards derive from these values — never from role names.
 */
export function useEffectivePermissions(): EffectivePermissionsView {
  const session = useSession();
  const currentUser = useCurrentUserQuery({ enabled: session.isAuthenticated });
  return {
    ...contextFromUser(currentUser.user),
    isLoading: session.isAuthenticated && currentUser.isLoading,
    isError: session.isAuthenticated && currentUser.isError,
  };
}
