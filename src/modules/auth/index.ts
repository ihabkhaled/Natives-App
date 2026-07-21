export { buildAuthMembership, buildAuthUser } from './factories/auth.factory';
export { selectActiveMembership } from './helpers/active-membership.helper';
export { useActiveTeamScope, type ActiveTeamScopeView } from './hooks/use-active-team-scope.hook';
export {
  useCurrentUserQuery,
  type CurrentUserQueryOptions,
  type CurrentUserQueryView,
} from './hooks/use-current-user-query.hook';
export {
  useEffectivePermissions,
  type EffectivePermissionsView,
} from './hooks/use-effective-permissions.hook';
export { useSession, type SessionView } from './hooks/use-session.hook';
export { useTeamSwitcher, type TeamSwitcherView } from './hooks/use-team-switcher.hook';
export type { TeamOptionView } from './helpers/team-switcher.helper';
export { useLogoutMutation, type LogoutMutationView } from './mutations/use-logout-mutation.hook';
export { authQueryKeys } from './queries/auth.keys';
export { createAuthTokenRepository, getAuthTokenRepository } from './repositories/token.repository';
export { getAuthRouteDefinitions } from './routes/auth.routes';
export {
  authAckSchema,
  authMembershipDtoSchema,
  authTokensDtoSchema,
  authUserDtoSchema,
  invitationDetailsDtoSchema,
  loginResponseSchema,
  logoutResponseSchema,
  refreshResponseSchema,
  revokeOthersResponseSchema,
  sessionDtoSchema,
  sessionListResponseSchema,
} from './schemas/auth.schema';
export { handleAuthFailure } from './services/auth-failure.service';
export { bootstrapSessionFromStoredTokens } from './services/bootstrap-session.service';
export { createRefreshExecutor } from './services/refresh-session.service';
export {
  ACCOUNT_STATE,
  MEMBERSHIP_SCOPE_STATUSES,
  SESSION_STATUS,
  type AccountState,
  type AuthMembership,
  type AuthUser,
  type MembershipScopeStatus,
  type SessionStatus,
} from './types/auth.types';
