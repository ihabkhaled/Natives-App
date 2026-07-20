import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildRostersQueryOptions } from '../queries/competitions.query';
import type { RosterPage } from '../types/rosters.types';

/** One bounded page of the team competition and match rosters. */
export function useRostersQuery(teamId: string): RemoteQueryView<RosterPage> {
  return toRemoteQueryView(useAppQuery<RosterPage>(buildRostersQueryOptions(teamId)));
}
