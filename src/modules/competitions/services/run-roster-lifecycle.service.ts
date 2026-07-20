import { requestRosterLifecycle } from '../gateways/rosters.gateway';
import { runRequest } from '@/shared/errors';
import { mapRoster } from '../mappers/roster.mapper';
import type { Roster, RosterLifecycleCommand } from '../types/rosters.types';

/** Use case: publish, lock, or archive a roster with its version token. */
export function runRosterLifecycle(
  teamId: string,
  rosterId: string,
  command: RosterLifecycleCommand,
): Promise<Roster> {
  return runRequest(async () => mapRoster(await requestRosterLifecycle(teamId, rosterId, command)));
}
