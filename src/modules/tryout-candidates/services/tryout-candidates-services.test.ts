import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as gateway from '../gateways/tryout-candidates.gateway';
import { getTryoutCandidate } from './get-tryout-candidate.service';
import { listTryoutCandidates } from './list-tryout-candidates.service';
import { runTryoutRetention } from './run-tryout-retention.service';
import { withdrawTryoutCandidate } from './withdraw-tryout-candidate.service';

vi.mock('../gateways/tryout-candidates.gateway', () => ({
  requestTryoutCandidates: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 25, offset: 0 }),
  requestTryoutCandidate: vi.fn().mockResolvedValue({}),
  requestWithdrawTryoutCandidate: vi.fn().mockResolvedValue({}),
  requestTryoutRetention: vi.fn().mockResolvedValue({}),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('tryout-candidates services', () => {
  it('lists one page of the queue', async () => {
    await listTryoutCandidates({ teamId: 't1', limit: 25, offset: 0 });

    expect(gateway.requestTryoutCandidates).toHaveBeenCalledWith({
      teamId: 't1',
      limit: 25,
      offset: 0,
    });
  });

  it('reads one candidate on demand rather than reusing a list row', async () => {
    await getTryoutCandidate('t1', 'c1');

    expect(gateway.requestTryoutCandidate).toHaveBeenCalledWith('t1', 'c1');
  });

  it('carries the withdrawal command straight through', async () => {
    const command = {
      teamId: 't1',
      candidateId: 'c1',
      reason: 'Asked us to remove them.',
      expectedRecordVersion: 2,
    };
    await withdrawTryoutCandidate(command);

    expect(gateway.requestWithdrawTryoutCandidate).toHaveBeenCalledWith(command);
  });

  it('runs the retention sweep for the team', async () => {
    await runTryoutRetention('t1');

    expect(gateway.requestTryoutRetention).toHaveBeenCalledWith('t1');
  });
});
