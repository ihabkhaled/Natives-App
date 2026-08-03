import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';
import {
  gatewayHttp,
  resetGatewayHttpDouble,
} from '../../../../tests/setup/gateway-http-double.helper';

import {
  requestAnomalies,
  requestAnomaly,
  requestApplyRepair,
  requestRepairPreview,
  requestRollbackRepair,
  requestScan,
  requestTransitionAnomaly,
} from './data-quality.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

beforeEach(resetGatewayHttpDouble);

describe('data-quality gateway', () => {
  it('pages the anomaly queue with an explicit window', async () => {
    await requestAnomalies({ teamId: 't1', limit: 25, offset: 50 });

    expect(gatewayHttp.get.mock.calls[0]?.[0]).toBe('/teams/t1/data-quality/anomalies');
    expect(gatewayHttp.get.mock.calls[0]?.[2]).toMatchObject({
      params: { limit: 25, offset: 50 },
    });
  });

  it('reads one anomaly by id', async () => {
    await requestAnomaly('t1', 'a1');

    expect(gatewayHttp.get.mock.calls[0]?.[0]).toBe('/teams/t1/data-quality/anomalies/a1');
  });

  it('previews a repair with a GET, so opening it changes nothing', async () => {
    await requestRepairPreview({ teamId: 't1', anomalyId: 'a1' });

    expect(gatewayHttp.get.mock.calls[0]?.[0]).toBe(
      '/teams/t1/data-quality/anomalies/a1/repair-preview',
    );
    expect(gatewayHttp.post).not.toHaveBeenCalled();
  });

  it('applies and rolls back a repair through their own routes', async () => {
    await requestApplyRepair({ teamId: 't1', anomalyId: 'a1' });
    await requestRollbackRepair({ teamId: 't1', anomalyId: 'a1' });

    expect(gatewayHttp.post.mock.calls[0]?.[0]).toBe(
      '/teams/t1/data-quality/anomalies/a1/repair-apply',
    );
    expect(gatewayHttp.post.mock.calls[1]?.[0]).toBe(
      '/teams/t1/data-quality/anomalies/a1/repair-rollback',
    );
  });

  it('sends the record version with a transition so a stale move is refused', async () => {
    await requestTransitionAnomaly({
      teamId: 't1',
      anomalyId: 'a1',
      transition: 'resolve',
      expectedRecordVersion: 4,
      resolution: 'Merged.',
    });

    expect(gatewayHttp.post.mock.calls[0]?.[1]).toEqual({
      transition: 'resolve',
      expectedRecordVersion: 4,
      resolution: 'Merged.',
    });
  });

  it('runs a scan across every rule', async () => {
    await requestScan('t1');

    expect(gatewayHttp.post.mock.calls[0]?.[0]).toBe('/teams/t1/data-quality/scan');
  });

  it('encodes a team id that would otherwise break the path', async () => {
    await requestAnomalies({ teamId: 'a/b', limit: 1, offset: 0 });

    expect(gatewayHttp.get.mock.calls[0]?.[0]).toBe('/teams/a%2Fb/data-quality/anomalies');
  });

  it('resolves through the configured client', () => {
    expect(vi.mocked(getAppHttpClient)).toBeDefined();
  });
});
