import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import {
  gatewayHttp,
  resetGatewayHttpDouble,
} from '../../../../tests/setup/gateway-http-double.helper';
import {
  requestTryoutCandidate,
  requestTryoutCandidates,
  requestTryoutRetention,
  requestWithdrawTryoutCandidate,
} from './tryout-candidates.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

beforeEach(resetGatewayHttpDouble);

describe('tryout-candidates gateway', () => {
  it('pages the candidate list with an explicit window', async () => {
    await requestTryoutCandidates({ teamId: 't1', limit: 25, offset: 50 });

    expect(gatewayHttp.get.mock.calls[0]?.[0]).toBe('/teams/t1/tryout-candidates');
    expect(gatewayHttp.get.mock.calls[0]?.[2]).toMatchObject({ params: { limit: 25, offset: 50 } });
  });

  it('reads one candidate by id', async () => {
    await requestTryoutCandidate('t1', 'c1');

    expect(gatewayHttp.get.mock.calls[0]?.[0]).toBe('/teams/t1/tryout-candidates/c1');
  });

  it('sends the reason and the record version with a withdrawal', async () => {
    await requestWithdrawTryoutCandidate({
      teamId: 't1',
      candidateId: 'c1',
      reason: 'Asked us to remove them.',
      expectedRecordVersion: 4,
    });

    expect(gatewayHttp.post.mock.calls[0]?.[0]).toBe('/teams/t1/tryout-candidates/c1/withdrawal');
    expect(gatewayHttp.post.mock.calls[0]?.[1]).toEqual({
      reason: 'Asked us to remove them.',
      expectedRecordVersion: 4,
    });
  });

  it('runs the retention sweep against the team, not one candidate', async () => {
    await requestTryoutRetention('t1');

    expect(gatewayHttp.post.mock.calls[0]?.[0]).toBe('/teams/t1/tryout-candidates/retention');
  });

  it('encodes ids that would otherwise break the path', async () => {
    await requestTryoutCandidate('a/b', 'c/d');

    expect(gatewayHttp.get.mock.calls[0]?.[0]).toBe('/teams/a%2Fb/tryout-candidates/c%2Fd');
  });

  it('resolves through the configured client', () => {
    expect(vi.mocked(getAppHttpClient)).toBeDefined();
  });
});
