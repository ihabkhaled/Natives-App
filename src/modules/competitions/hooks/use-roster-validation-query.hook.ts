import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildRosterValidationQueryOptions } from '../queries/competitions.query';
import type { RosterValidation } from '../types/rosters.types';

/** The server-side validation preview for one roster. */
export function useRosterValidationQuery(
  teamId: string,
  rosterId: string,
): RemoteQueryView<RosterValidation> {
  return toRemoteQueryView(
    useAppQuery<RosterValidation>(buildRosterValidationQueryOptions(teamId, rosterId)),
  );
}
