import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildCompetitionsQueryOptions } from '../queries/competitions.query';
import type { CompetitionPage } from '../types/competitions.types';

/** One bounded page of the team's competitions. */
export function useCompetitionsQuery(teamId: string): RemoteQueryView<CompetitionPage> {
  return toRemoteQueryView(useAppQuery<CompetitionPage>(buildCompetitionsQueryOptions(teamId)));
}
