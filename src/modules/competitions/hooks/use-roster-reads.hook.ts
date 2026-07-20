import type { RemoteQueryView } from '@/shared/view';

import type { Roster, RosterEntry, RosterSnapshot, RosterValidation } from '../types/rosters.types';
import { useRosterEntriesQuery } from './use-roster-entries-query.hook';
import { useRosterQuery } from './use-roster-query.hook';
import { useRosterSnapshotsQuery } from './use-roster-snapshots-query.hook';
import { useRosterValidationQuery } from './use-roster-validation-query.hook';

/** The four roster reads, already unwrapped so the workspace stays a composition. */
export interface RosterReads {
  readonly query: RemoteQueryView<Roster>;
  readonly roster: Roster | null;
  readonly entries: readonly RosterEntry[];
  readonly validation: RosterValidation | null;
  readonly snapshots: readonly RosterSnapshot[];
  readonly publishable: boolean;
}

export function useRosterReads(teamId: string, rosterId: string): RosterReads {
  const query = useRosterQuery(teamId, rosterId);
  const entries = useRosterEntriesQuery(teamId, rosterId);
  const validation = useRosterValidationQuery(teamId, rosterId);
  const snapshots = useRosterSnapshotsQuery(teamId, rosterId);
  const validationRecord = validation.data ?? null;
  return {
    query,
    roster: query.data ?? null,
    entries: entries.data?.items ?? [],
    validation: validationRecord,
    snapshots: snapshots.data?.items ?? [],
    publishable: validationRecord?.publishable === true,
  };
}
