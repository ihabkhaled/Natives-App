import { afterEach, describe, expect, it, vi } from 'vitest';

import * as gateway from '../gateways/reports.gateway';
import { createReportDownload } from './create-report-download.service';
import { generateReport } from './generate-report.service';
import { getReportJob } from './get-report-job.service';
import { listReportJobs } from './list-report-jobs.service';
import { retryReport } from './retry-report.service';

vi.mock('../gateways/reports.gateway');

const jobDto = {
  jobId: 'j1',
  teamId: 't1',
  seasonId: null,
  template: 'team_overview' as const,
  format: 'csv' as const,
  privacyClass: 'team' as const,
  status: 'queued' as const,
  progress: 0,
  retryCount: 0,
  calculationVersion: 'reports-v1',
  snapshotAt: '2026-07-20T09:00:00.000Z',
  checksum: null,
  rowCount: null,
  failureReason: null,
  expiresAt: '2026-07-30T09:00:00.000Z',
  recordVersion: 1,
  completedAt: null,
  createdAt: '2026-07-20T09:00:00.000Z',
  updatedAt: '2026-07-20T09:00:00.000Z',
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('reports services', () => {
  it('lists, reads, generates, retries jobs and mints a download', async () => {
    vi.mocked(gateway.requestReportJobs).mockResolvedValue({
      items: [jobDto],
      total: 1,
      limit: 20,
      offset: 0,
    });
    vi.mocked(gateway.requestReportJob).mockResolvedValue(jobDto);
    vi.mocked(gateway.requestGenerateReport).mockResolvedValue(jobDto);
    vi.mocked(gateway.requestRetryReport).mockResolvedValue({ ...jobDto, status: 'running' });
    vi.mocked(gateway.requestDownloadTicket).mockResolvedValue({
      url: 'https://x',
      expiresAt: '2026-07-20T09:20:00.000Z',
      checksum: 'sha256:abc',
    });

    expect((await listReportJobs('t1', { template: null, status: null }, 0)).jobs).toHaveLength(1);
    expect((await getReportJob('t1', 'j1')).jobId).toBe('j1');
    expect(
      (await generateReport('t1', { template: 'team_overview', format: 'csv', seasonId: null }))
        .status,
    ).toBe('queued');
    expect((await retryReport('t1', 'j1')).status).toBe('running');
    expect((await createReportDownload('t1', 'j1')).checksum).toBe('sha256:abc');
  });
});
