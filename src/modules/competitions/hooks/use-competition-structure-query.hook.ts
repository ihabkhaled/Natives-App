import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildCompetitionStructureQueryOptions } from '../queries/competitions.query';
import type { CompetitionStructure } from '../types/competitions.types';

/** Stages and rounds for one competition. */
export function useCompetitionStructureQuery(
  teamId: string,
  competitionId: string,
): RemoteQueryView<CompetitionStructure> {
  return toRemoteQueryView(
    useAppQuery<CompetitionStructure>(buildCompetitionStructureQueryOptions(teamId, competitionId)),
  );
}
