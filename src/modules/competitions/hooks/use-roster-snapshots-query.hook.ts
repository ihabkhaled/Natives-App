import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildRosterSnapshotsQueryOptions } from '../queries/competitions.query';
import type { RosterSnapshotPage } from '../types/rosters.types';

/** The append-only roster revision history. */
export function useRosterSnapshotsQuery(
  teamId: string,
  rosterId: string,
): RemoteQueryView<RosterSnapshotPage> {
  return toRemoteQueryView(
    useAppQuery<RosterSnapshotPage>(buildRosterSnapshotsQueryOptions(teamId, rosterId)),
  );
}
