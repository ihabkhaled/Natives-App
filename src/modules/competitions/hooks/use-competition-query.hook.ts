import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildCompetitionQueryOptions } from '../queries/competitions.query';
import type { Competition } from '../types/competitions.types';

/** One competition record. */
export function useCompetitionQuery(
  teamId: string,
  competitionId: string,
): RemoteQueryView<Competition> {
  return toRemoteQueryView(
    useAppQuery<Competition>(buildCompetitionQueryOptions(teamId, competitionId)),
  );
}
