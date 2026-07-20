import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildTryoutCandidatesQueryOptions } from '../queries/tryouts.query';
import type { CandidatePage } from '../types/tryouts.types';

/** The privacy-safe candidate list for one tryout event. */
export function useTryoutCandidatesQuery(
  teamId: string,
  tryoutId: string,
): RemoteQueryView<CandidatePage> {
  return toRemoteQueryView(
    useAppQuery<CandidatePage>(buildTryoutCandidatesQueryOptions(teamId, tryoutId)),
  );
}
