import { mergePermissionSets } from '../helpers/effective-permissions.helper';
import { ACCOUNT_STATE, type AuthUser } from '../types/auth.types';
import { useActiveTeamScope } from './use-active-team-scope.hook';
import { useCurrentUserQuery } from './use-current-user-query.hook';
import { useScopedPermissionsQuery } from './use-scoped-permissions-query.hook';
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
 * The authenticated session's effective authorization context.
 *
 * Two sources, deliberately. `/auth/me` reports the principal's GLOBAL grants —
 * enough for a super administrator, and nothing at all for a team-scoped role.
 * `/rbac/me/permissions?teamId=` reports what they may do INSIDE the active
 * team. A team administrator holds 23 permissions globally and 81 in scope, so
 * reading only the first hid Members, Assessments, Team settings, Roles and
 * every other team screen from the exact persona who owns them. Navigation and
 * guards derive from the union of both — never from role names.
 *
 * The scoped fetch counts as loading: deciding a guard before it lands would
 * forbid a screen the principal is allowed to see and then correct itself,
 * which reads as a flash of "no access".
 */
export function useEffectivePermissions(): EffectivePermissionsView {
  const session = useSession();
  const currentUser = useCurrentUserQuery({ enabled: session.isAuthenticated });
  const scope = useActiveTeamScope();
  const scoped = useScopedPermissionsQuery(scope.teamId, session.isAuthenticated);
  const context = contextFromUser(currentUser.user);
  return {
    ...context,
    permissions: mergePermissionSets(context.permissions, scoped.permissions),
    isLoading: session.isAuthenticated && (currentUser.isLoading || scoped.isLoading),
    isError: session.isAuthenticated && currentUser.isError,
  };
}
