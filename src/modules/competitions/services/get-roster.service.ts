import { requestRoster } from '../gateways/rosters.gateway';
import { runRequest } from '@/shared/errors';
import { mapRoster } from '../mappers/roster.mapper';
import type { Roster } from '../types/rosters.types';

/** Use case: one roster with its size policy and revision state. */
export function getRoster(teamId: string, rosterId: string): Promise<Roster> {
  return runRequest(async () => mapRoster(await requestRoster(teamId, rosterId)));
}
