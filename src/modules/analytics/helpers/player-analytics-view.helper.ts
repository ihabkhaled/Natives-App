import type { MemberDirectoryItem } from '@/modules/members';
import type { RemoteQueryView } from '@/shared/view';
import { resolveAsyncViewStatus } from '@/shared/view';
import type { AsyncViewStatus } from '@/shared/ui';

import type { AnalyticsSeries } from '../types/analytics.types';

/** Whether the caller may read this player's series under the dual gate. */
export function mayReadPlayerSeries(
  membershipId: string,
  ownMembershipId: string,
  canReadTeam: boolean,
  canReadSelf: boolean,
): boolean {
  const isSelf = membershipId !== '' && membershipId === ownMembershipId;
  return canReadTeam || (isSelf && canReadSelf);
}

/** The player's display name from the directory, falling back to the id. */
export function resolvePlayerName(
  members: readonly MemberDirectoryItem[] | undefined,
  membershipId: string,
): string {
  return (
    (members ?? []).find((member) => member.membershipId === membershipId)?.displayName ??
    membershipId
  );
}

/** The scope facts the player-analytics status decision reads. */
export interface PlayerStatusInputs {
  readonly isLoading: boolean;
  readonly mayRead: boolean;
  readonly isOffline: boolean;
  readonly isScopeMissing: boolean;
  readonly query: RemoteQueryView<AnalyticsSeries>;
}

/**
 * The single state the player screen presents. A missing scope is not an
 * error state — it renders the designed not-found panel — so it is excluded
 * from the error signal and counts as "data present" for the resolver.
 */
export function resolvePlayerAnalyticsStatus(inputs: PlayerStatusInputs): AsyncViewStatus {
  return resolveAsyncViewStatus({
    isForbidden: !inputs.isLoading && !inputs.mayRead,
    isLoading: inputs.isLoading || inputs.query.isLoading,
    hasError: inputs.query.error !== null && !inputs.isScopeMissing,
    isOffline: inputs.isOffline,
    hasData: inputs.query.data !== undefined || inputs.isScopeMissing,
    hasItems: inputs.query.data !== undefined,
  });
}
