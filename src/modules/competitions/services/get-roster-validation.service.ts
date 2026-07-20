import { requestRosterValidation } from '../gateways/rosters.gateway';
import { runRequest } from '@/shared/errors';
import { mapRosterValidation } from '../mappers/roster.mapper';
import type { RosterValidation } from '../types/rosters.types';

/**
 * Use case: the server-side validation preview. The client presents the
 * violations; it never recomputes the constraint policy itself.
 */
export function getRosterValidation(teamId: string, rosterId: string): Promise<RosterValidation> {
  return runRequest(async () =>
    mapRosterValidation(await requestRosterValidation(teamId, rosterId)),
  );
}
