import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as gateway from '../gateways/governance.gateway';
import { listGovernanceMeetings } from './list-governance-meetings.service';
import { listGovernanceTasks } from './list-governance-tasks.service';

vi.mock('../gateways/governance.gateway', () => ({
  requestGovernanceMeetings: vi
    .fn()
    .mockResolvedValue({ items: [], total: 0, limit: 25, offset: 0 }),
  requestGovernanceTasks: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 25, offset: 0 }),
  requestGovernanceMeeting: vi.fn(),
  requestGovernanceTask: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('governance services', () => {
  it('lists one page of meetings', async () => {
    await listGovernanceMeetings({ teamId: 't1', limit: 25, offset: 0 });

    expect(gateway.requestGovernanceMeetings).toHaveBeenCalledWith({
      teamId: 't1',
      limit: 25,
      offset: 0,
    });
  });

  it('lists one page of tasks', async () => {
    await listGovernanceTasks({ teamId: 't1', limit: 25, offset: 0 });

    expect(gateway.requestGovernanceTasks).toHaveBeenCalledOnce();
  });
});
