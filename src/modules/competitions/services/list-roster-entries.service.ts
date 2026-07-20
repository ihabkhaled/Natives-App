import { requestRosterEntries } from '../gateways/rosters.gateway';
import { runRequest } from '@/shared/errors';
import { mapRosterEntryPage } from '../mappers/roster.mapper';
import type { RosterEntryPage } from '../types/rosters.types';

/** Use case: every rostered player, including those with nothing recorded. */
export function listRosterEntries(teamId: string, rosterId: string): Promise<RosterEntryPage> {
  return runRequest(async () => mapRosterEntryPage(await requestRosterEntries(teamId, rosterId)));
}
