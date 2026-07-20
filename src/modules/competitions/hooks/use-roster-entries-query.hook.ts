import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildRosterEntriesQueryOptions } from '../queries/competitions.query';
import type { RosterEntryPage } from '../types/rosters.types';

/** Every rostered player for one roster. */
export function useRosterEntriesQuery(
  teamId: string,
  rosterId: string,
): RemoteQueryView<RosterEntryPage> {
  return toRemoteQueryView(
    useAppQuery<RosterEntryPage>(buildRosterEntriesQueryOptions(teamId, rosterId)),
  );
}
