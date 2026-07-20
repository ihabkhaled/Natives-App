import { requestRosterSnapshots } from '../gateways/rosters.gateway';
import { runRequest } from '@/shared/errors';
import { mapRosterSnapshotPage } from '../mappers/roster.mapper';
import type { RosterSnapshotPage } from '../types/rosters.types';

/** Use case: the append-only roster revision history. */
export function listRosterSnapshots(teamId: string, rosterId: string): Promise<RosterSnapshotPage> {
  return runRequest(async () =>
    mapRosterSnapshotPage(await requestRosterSnapshots(teamId, rosterId)),
  );
}
