import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import {
  requestDownloadTicket,
  requestGenerateReport,
  requestReportJob,
  requestReportJobs,
  requestRetryReport,
} from './reports.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

const get = vi.fn();
const post = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  get.mockResolvedValue({});
  post.mockResolvedValue({});
  vi.mocked(getAppHttpClient).mockReturnValue({ get, post } as never);
});

describe('reports.gateway', () => {
  it('reads a filtered job page', async () => {
    await requestReportJobs('t1', { template: 'attendance', status: 'completed' }, 20);
    const [path, , options] = get.mock.calls[0] as [
      string,
      unknown,
      { params: Record<string, unknown> },
    ];
    expect(path).toBe('/teams/t1/reports');
    expect(options.params).toMatchObject({
      template: 'attendance',
      status: 'completed',
      offset: 20,
    });
  });

  it('omits unset facets', async () => {
    await requestReportJobs('t1', { template: null, status: null }, 0);
    const [, , options] = get.mock.calls[0] as [
      string,
      unknown,
      { params: Record<string, unknown> },
    ];
    expect(options.params).not.toHaveProperty('template');
    expect(options.params).not.toHaveProperty('status');
  });

  it('reads one job, generates, retries, and mints a download', async () => {
    await requestReportJob('t1', 'j1');
    expect(get.mock.calls[0]?.[0]).toBe('/teams/t1/reports/j1');

    await requestGenerateReport('t1', { template: 'team_overview', format: 'csv', seasonId: null });
    expect(post.mock.calls[0]?.[0]).toBe('/teams/t1/reports');

    await requestRetryReport('t1', 'j1');
    expect(post.mock.calls[1]?.[0]).toBe('/teams/t1/reports/j1/retry');

    await requestDownloadTicket('t1', 'j1');
    expect(get.mock.calls[1]?.[0]).toBe('/teams/t1/reports/j1/download');
  });
});
