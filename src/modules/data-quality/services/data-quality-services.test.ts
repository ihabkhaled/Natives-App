import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as gateway from '../gateways/data-quality.gateway';
import { applyRepair } from './apply-repair.service';
import { listAnomalies } from './list-anomalies.service';
import { previewRepair } from './preview-repair.service';
import { rollbackRepair } from './rollback-repair.service';
import { runScan } from './run-scan.service';
import { transitionAnomaly } from './transition-anomaly.service';

vi.mock('../gateways/data-quality.gateway', () => ({
  requestAnomalies: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 25, offset: 0 }),
  requestAnomaly: vi.fn(),
  requestRepairPreview: vi.fn().mockResolvedValue({}),
  requestApplyRepair: vi.fn().mockResolvedValue({}),
  requestRollbackRepair: vi.fn().mockResolvedValue({}),
  requestTransitionAnomaly: vi.fn().mockResolvedValue({}),
  requestScan: vi.fn().mockResolvedValue({}),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('data-quality services', () => {
  it('lists one page of the queue', async () => {
    await listAnomalies({ teamId: 't1', limit: 25, offset: 0 });

    expect(gateway.requestAnomalies).toHaveBeenCalledWith({ teamId: 't1', limit: 25, offset: 0 });
  });

  it('previews before applying, and applies through its own command', async () => {
    await previewRepair({ teamId: 't1', anomalyId: 'a1' });
    await applyRepair({ teamId: 't1', anomalyId: 'a1' });

    expect(gateway.requestRepairPreview).toHaveBeenCalledOnce();
    expect(gateway.requestApplyRepair).toHaveBeenCalledOnce();
  });

  it('rolls a repair back', async () => {
    await rollbackRepair({ teamId: 't1', anomalyId: 'a1' });

    expect(gateway.requestRollbackRepair).toHaveBeenCalledOnce();
  });

  it('carries the lifecycle move straight through', async () => {
    await transitionAnomaly({
      teamId: 't1',
      anomalyId: 'a1',
      transition: 'acknowledge',
      expectedRecordVersion: 1,
      resolution: null,
    });

    expect(gateway.requestTransitionAnomaly).toHaveBeenCalledOnce();
  });

  it('runs a scan for the team', async () => {
    await runScan('t1');

    expect(gateway.requestScan).toHaveBeenCalledWith('t1');
  });
});
