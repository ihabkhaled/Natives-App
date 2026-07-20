import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildOpponentsQueryOptions } from '../queries/competitions.query';
import type { OpponentPage } from '../types/competitions.types';

/** The team's opponent directory. */
export function useOpponentsQuery(teamId: string): RemoteQueryView<OpponentPage> {
  return toRemoteQueryView(useAppQuery<OpponentPage>(buildOpponentsQueryOptions(teamId)));
}
