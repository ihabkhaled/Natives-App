import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildSquadSelectionsQueryOptions } from '../queries/competitions.query';
import type { SquadSelectionPage } from '../types/competitions.types';

/** Current selections for one squad. */
export function useSquadSelectionsQuery(
  teamId: string,
  squadId: string,
): RemoteQueryView<SquadSelectionPage> {
  return toRemoteQueryView(
    useAppQuery<SquadSelectionPage>(buildSquadSelectionsQueryOptions(teamId, squadId)),
  );
}
