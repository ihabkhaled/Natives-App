import { afterEach, describe, expect, it, vi } from 'vitest';

import { requestJobHealth } from '../gateways/operations.gateway';
import { listJobHealth } from './list-job-health.service';

vi.mock('../gateways/operations.gateway', () => ({ requestJobHealth: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

/** Live since contract 1.2.0: statuses derive from real recorded runs. */
describe('listJobHealth', () => {
  it('maps the wire items to job health rows', async () => {
    vi.mocked(requestJobHealth).mockResolvedValue({
      items: [
        { jobKey: 'points.recalculate', status: 'healthy', lastRunAt: null, failureCount: 0 },
      ],
    } as never);

    const jobs = await listJobHealth();

    expect(requestJobHealth).toHaveBeenCalledOnce();
    expect(jobs).toEqual([
      { jobKey: 'points.recalculate', status: 'healthy', lastRunAt: null, failureCount: 0 },
    ]);
  });

  it('normalizes a transport failure into an AppError', async () => {
    vi.mocked(requestJobHealth).mockRejectedValue(new Error('boom'));

    await expect(listJobHealth()).rejects.toMatchObject({ name: 'AppError' });
  });
});
