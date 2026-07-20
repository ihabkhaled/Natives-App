import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  rosterEntriesPath,
  rosterEntryRemovalPath,
  rosterLockPath,
  rosterPath,
  rosterSnapshotsPath,
  rosterTransitionPath,
  rosterValidationPath,
  rostersPath,
} from '../constants/competitions-api.constants';
import { ROSTER_ENTRY_PARAMS, ROSTER_PAGE_PARAMS } from '../constants/rosters.constants';
import {
  rosterEntryListResponseSchema,
  rosterEntryResponseSchema,
  rosterListResponseSchema,
  rosterResponseSchema,
  rosterSnapshotListResponseSchema,
  rosterValidationResponseSchema,
} from '../schemas/roster.schema';
import type { RemoveRosterEntryCommand, RosterLifecycleCommand } from '../types/rosters.types';

type RosterListDto = SchemaOutput<typeof rosterListResponseSchema>;
type RosterDto = SchemaOutput<typeof rosterResponseSchema>;
type EntryListDto = SchemaOutput<typeof rosterEntryListResponseSchema>;
type EntryDto = SchemaOutput<typeof rosterEntryResponseSchema>;
type ValidationDto = SchemaOutput<typeof rosterValidationResponseSchema>;
type SnapshotListDto = SchemaOutput<typeof rosterSnapshotListResponseSchema>;

/** One bounded page of the team's competition and match rosters. */
export function requestRosters(teamId: string): Promise<RosterListDto> {
  return getAppHttpClient().get(rostersPath(teamId), rosterListResponseSchema, {
    params: ROSTER_PAGE_PARAMS,
  });
}

export function requestRoster(teamId: string, rosterId: string): Promise<RosterDto> {
  return getAppHttpClient().get(rosterPath(teamId, rosterId), rosterResponseSchema);
}

export function requestRosterEntries(teamId: string, rosterId: string): Promise<EntryListDto> {
  return getAppHttpClient().get(
    rosterEntriesPath(teamId, rosterId),
    rosterEntryListResponseSchema,
    {
      params: ROSTER_ENTRY_PARAMS,
    },
  );
}

/** The server-side validation preview: composition plus every violation. */
export function requestRosterValidation(teamId: string, rosterId: string): Promise<ValidationDto> {
  return getAppHttpClient().get(
    rosterValidationPath(teamId, rosterId),
    rosterValidationResponseSchema,
  );
}

/** The append-only revision history the roster has taken. */
export function requestRosterSnapshots(teamId: string, rosterId: string): Promise<SnapshotListDto> {
  return getAppHttpClient().get(
    rosterSnapshotsPath(teamId, rosterId),
    rosterSnapshotListResponseSchema,
    { params: ROSTER_PAGE_PARAMS },
  );
}

export function requestRemoveRosterEntry(
  teamId: string,
  rosterId: string,
  command: RemoveRosterEntryCommand,
): Promise<EntryDto> {
  return getAppHttpClient().post(
    rosterEntryRemovalPath(teamId, rosterId, command.membershipId),
    { reason: command.reason },
    rosterEntryResponseSchema,
  );
}

/** Lock and transition share a shape: both carry the record version token. */
export function requestRosterLifecycle(
  teamId: string,
  rosterId: string,
  command: RosterLifecycleCommand,
): Promise<RosterDto> {
  if (command.intent === 'lock') {
    return getAppHttpClient().post(
      rosterLockPath(teamId, rosterId),
      { expectedRecordVersion: command.expectedRecordVersion },
      rosterResponseSchema,
    );
  }
  return getAppHttpClient().post(
    rosterTransitionPath(teamId, rosterId),
    { transition: command.intent, expectedRecordVersion: command.expectedRecordVersion },
    rosterResponseSchema,
  );
}
