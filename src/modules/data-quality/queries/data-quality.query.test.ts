import { describe, expect, it, vi } from 'vitest';

import { ANOMALY_PAGE_SIZE } from '../constants/data-quality.constants';
import { buildAnomaliesQueryOptions } from './data-quality.query';
import { dataQualityQueryKeys } from './data-quality.keys';

vi.mock('../services/list-anomalies.service', () => ({
  listAnomalies: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 25, offset: 0 }),
}));

describe('buildAnomaliesQueryOptions', () => {
  it('keys the read by team and page offset', () => {
    expect(buildAnomaliesQueryOptions('t1', 25).queryKey).toEqual(
      dataQualityQueryKeys.anomalies('t1', 25),
    );
  });

  it('asks for exactly one page', async () => {
    const { listAnomalies } = await import('../services/list-anomalies.service');
    await buildAnomaliesQueryOptions('t1', 50).queryFn();

    expect(listAnomalies).toHaveBeenCalledWith({
      teamId: 't1',
      limit: ANOMALY_PAGE_SIZE,
      offset: 50,
    });
  });
});

describe('dataQualityQueryKeys', () => {
  it('scopes every key under the team so switching teams cannot reuse a cache', () => {
    expect(dataQualityQueryKeys.anomalies('t1', 0)).toEqual([
      'data-quality',
      'team',
      't1',
      'anomalies',
      0,
    ]);
    expect(dataQualityQueryKeys.repairPreview('t1', 'a1')).toContain('a1');
  });
});
