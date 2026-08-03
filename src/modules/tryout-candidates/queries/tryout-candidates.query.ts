import { TRYOUT_CANDIDATE_PAGE_SIZE } from '../constants/tryout-candidates.constants';
import { listTryoutCandidates } from '../services/list-tryout-candidates.service';
import type { TryoutCandidatesPage } from '../types/tryout-candidates.types';
import { tryoutCandidatesQueryKeys } from './tryout-candidates.keys';

/** Query options for one page of the candidate list. */
export function buildTryoutCandidatesQueryOptions(
  teamId: string,
  offset: number,
): {
  readonly queryKey: readonly unknown[];
  readonly queryFn: () => Promise<TryoutCandidatesPage>;
} {
  return {
    queryKey: tryoutCandidatesQueryKeys.list(teamId, offset),
    queryFn: (): Promise<TryoutCandidatesPage> =>
      listTryoutCandidates({ teamId, limit: TRYOUT_CANDIDATE_PAGE_SIZE, offset }),
  };
}
