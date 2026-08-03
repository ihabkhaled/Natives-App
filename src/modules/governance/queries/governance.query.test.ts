import { describe, expect, it, vi } from 'vitest';

import { GOVERNANCE_PAGE_SIZE } from '../constants/governance.constants';
import { governanceQueryKeys } from './governance.keys';
import { buildMeetingsQueryOptions, buildTasksQueryOptions } from './governance.query';

vi.mock('../services/list-governance-meetings.service', () => ({
  listGovernanceMeetings: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 25, offset: 0 }),
}));
vi.mock('../services/list-governance-tasks.service', () => ({
  listGovernanceTasks: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 25, offset: 0 }),
}));

describe('governance query options', () => {
  it('keys each list by team and offset', () => {
    expect(buildMeetingsQueryOptions('t1', 25).queryKey).toEqual(
      governanceQueryKeys.meetings('t1', 25),
    );
    expect(buildTasksQueryOptions('t1', 0).queryKey).toEqual(governanceQueryKeys.tasks('t1', 0));
  });

  it('asks for exactly one page of each', async () => {
    const { listGovernanceMeetings } = await import('../services/list-governance-meetings.service');
    const { listGovernanceTasks } = await import('../services/list-governance-tasks.service');

    await buildMeetingsQueryOptions('t1', 50).queryFn();
    await buildTasksQueryOptions('t1', 0).queryFn();

    expect(listGovernanceMeetings).toHaveBeenCalledWith({
      teamId: 't1',
      limit: GOVERNANCE_PAGE_SIZE,
      offset: 50,
    });
    expect(listGovernanceTasks).toHaveBeenCalledOnce();
  });

  it('scopes every key under the team so switching teams cannot reuse a cache', () => {
    expect(governanceQueryKeys.meetings('t1', 0)).toEqual([
      'governance',
      'team',
      't1',
      'meetings',
      0,
    ]);
  });
});
