import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildCompetitionFixturesQueryOptions } from '../queries/competitions.query';
import type { FixturePage } from '../types/competitions.types';

/** One bounded page of a competition's fixtures. */
export function useCompetitionFixturesQuery(
  teamId: string,
  competitionId: string,
): RemoteQueryView<FixturePage> {
  return toRemoteQueryView(
    useAppQuery<FixturePage>(buildCompetitionFixturesQueryOptions(teamId, competitionId)),
  );
}
