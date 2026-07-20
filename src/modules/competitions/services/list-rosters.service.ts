import { requestRosters } from '../gateways/rosters.gateway';
import { runRequest } from '@/shared/errors';
import { mapRosterPage } from '../mappers/roster.mapper';
import type { RosterPage } from '../types/rosters.types';

/** Use case: one bounded page of the team competition and match rosters. */
export function listRosters(teamId: string): Promise<RosterPage> {
  return runRequest(async () => mapRosterPage(await requestRosters(teamId)));
}
