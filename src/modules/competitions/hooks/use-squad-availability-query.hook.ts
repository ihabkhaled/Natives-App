import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildSquadAvailabilityQueryOptions } from '../queries/competitions.query';
import type { SquadAvailabilityPage } from '../types/competitions.types';

/** Declared availability for one squad's window. */
export function useSquadAvailabilityQuery(
  teamId: string,
  squadId: string,
): RemoteQueryView<SquadAvailabilityPage> {
  return toRemoteQueryView(
    useAppQuery<SquadAvailabilityPage>(buildSquadAvailabilityQueryOptions(teamId, squadId)),
  );
}
