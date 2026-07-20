import { requestRemoveRosterEntry } from '../gateways/rosters.gateway';
import { runRequest } from '@/shared/errors';
import { mapRosterEntry } from '../mappers/roster.mapper';
import type { RemoveRosterEntryCommand, RosterEntry } from '../types/rosters.types';

/** Use case: withdraw one player from a roster. */
export function removeRosterEntry(
  teamId: string,
  rosterId: string,
  command: RemoveRosterEntryCommand,
): Promise<RosterEntry> {
  return runRequest(async () =>
    mapRosterEntry(await requestRemoveRosterEntry(teamId, rosterId, command)),
  );
}
