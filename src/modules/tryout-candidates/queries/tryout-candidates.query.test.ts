import { describe, expect, it, vi } from 'vitest';

import { TRYOUT_CANDIDATE_PAGE_SIZE } from '../constants/tryout-candidates.constants';
import { tryoutCandidatesQueryKeys } from './tryout-candidates.keys';
import { buildTryoutCandidatesQueryOptions } from './tryout-candidates.query';

vi.mock('../services/list-tryout-candidates.service', () => ({
  listTryoutCandidates: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 25, offset: 0 }),
}));

describe('buildTryoutCandidatesQueryOptions', () => {
  it('keys the read by team and page offset', () => {
    expect(buildTryoutCandidatesQueryOptions('t1', 25).queryKey).toEqual(
      tryoutCandidatesQueryKeys.list('t1', 25),
    );
  });

  it('asks for exactly one page', async () => {
    const { listTryoutCandidates } = await import('../services/list-tryout-candidates.service');
    await buildTryoutCandidatesQueryOptions('t1', 50).queryFn();

    expect(listTryoutCandidates).toHaveBeenCalledWith({
      teamId: 't1',
      limit: TRYOUT_CANDIDATE_PAGE_SIZE,
      offset: 50,
    });
  });
});

describe('tryoutCandidatesQueryKeys', () => {
  it('scopes every key under the team so switching teams cannot reuse a cache', () => {
    expect(tryoutCandidatesQueryKeys.all).toEqual(['tryout-candidates']);
    expect(tryoutCandidatesQueryKeys.team('t1')).toEqual(['tryout-candidates', 'team', 't1']);
    expect(tryoutCandidatesQueryKeys.list('t1', 0)).toEqual([
      'tryout-candidates',
      'team',
      't1',
      'list',
      0,
    ]);
  });

  it('keys a single record separately from the list', () => {
    expect(tryoutCandidatesQueryKeys.detail('t1', 'c1')).toEqual([
      'tryout-candidates',
      'team',
      't1',
      'detail',
      'c1',
    ]);
  });
});
