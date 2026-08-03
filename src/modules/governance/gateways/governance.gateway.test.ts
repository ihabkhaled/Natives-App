import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  gatewayHttp,
  resetGatewayHttpDouble,
} from '../../../../tests/setup/gateway-http-double.helper';

import {
  requestGovernanceMeeting,
  requestGovernanceMeetings,
  requestGovernanceTask,
  requestGovernanceTasks,
} from './governance.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

beforeEach(resetGatewayHttpDouble);

describe('governance gateway', () => {
  it('pages meetings with an explicit window', async () => {
    await requestGovernanceMeetings({ teamId: 't1', limit: 25, offset: 25 });

    expect(gatewayHttp.get.mock.calls[0]?.[0]).toBe('/teams/t1/governance/meetings');
    expect(gatewayHttp.get.mock.calls[0]?.[2]).toMatchObject({
      params: { limit: 25, offset: 25 },
    });
  });

  it('reads one meeting by id', async () => {
    await requestGovernanceMeeting('t1', 'm1');

    expect(gatewayHttp.get.mock.calls[0]?.[0]).toBe('/teams/t1/governance/meetings/m1');
  });

  it('pages tasks and reads one by id', async () => {
    await requestGovernanceTasks({ teamId: 't1', limit: 25, offset: 0 });
    await requestGovernanceTask('t1', 'k1');

    expect(gatewayHttp.get.mock.calls[0]?.[0]).toBe('/teams/t1/governance/tasks');
    expect(gatewayHttp.get.mock.calls[1]?.[0]).toBe('/teams/t1/governance/tasks/k1');
  });

  it('encodes ids that would otherwise break the path', async () => {
    await requestGovernanceMeeting('a/b', 'm/1');

    expect(gatewayHttp.get.mock.calls[0]?.[0]).toBe('/teams/a%2Fb/governance/meetings/m%2F1');
  });
});
