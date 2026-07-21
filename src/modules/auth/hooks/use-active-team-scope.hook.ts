import { NO_TEAM_SCOPE } from '../constants/team-scope.constants';
import { selectActiveMembership } from '../helpers/active-membership.helper';
import { useActiveTeamStore } from '../store/active-team.store';
import { useCurrentUserQuery } from './use-current-user-query.hook';

export interface ActiveTeamScopeView {
  /** Empty string while the scope is unresolved; every cache key is gated on it. */
  readonly teamId: string;
  readonly membershipId: string;
  /** Null when the team has no season — never a fabricated placeholder. */
  readonly seasonId: string | null;
  readonly teamName: string;
  readonly isLoading: boolean;
  readonly isError: boolean;
}

/**
 * The team/season scope the signed-in principal is currently acting inside,
 * resolved from the real `memberships[]` the identity endpoints return and the
 * team they last switched to. Every team-scoped query keys off `teamId` and
 * every "mine" call off `membershipId`, so a switch re-keys the whole cache.
 */
export function useActiveTeamScope(): ActiveTeamScopeView {
  const currentUser = useCurrentUserQuery();
  const selectedTeamId = useActiveTeamStore((state) => state.selectedTeamId);
  const membership = selectActiveMembership(currentUser.user?.memberships ?? [], selectedTeamId);
  const scope =
    membership === null
      ? NO_TEAM_SCOPE
      : {
          teamId: membership.teamId,
          membershipId: membership.membershipId,
          seasonId: membership.seasonId,
          teamName: membership.teamName,
        };
  return { ...scope, isLoading: currentUser.isLoading, isError: currentUser.isError };
}
