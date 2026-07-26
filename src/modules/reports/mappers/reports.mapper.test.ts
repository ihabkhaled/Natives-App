import { describe, expect, it } from 'vitest';

import { mapDownloadTicket, mapReportJob, mapReportJobsPage } from './reports.mapper';

const jobDto = {
  jobId: 'j1',
  teamId: 't1',
  seasonId: null,
  template: 'team_overview' as const,
  format: 'csv' as const,
  privacyClass: 'team' as const,
  status: 'completed' as const,
  progress: 100,
  retryCount: 0,
  calculationVersion: 'reports-v1',
  snapshotAt: '2026-07-20T09:00:00.000Z',
  checksum: 'sha256:abc',
  rowCount: 12,
  failureReason: null,
  expiresAt: '2026-07-30T09:00:00.000Z',
  recordVersion: 1,
  completedAt: '2026-07-20T09:05:00.000Z',
  createdAt: '2026-07-20T09:00:00.000Z',
  updatedAt: '2026-07-20T09:00:00.000Z',
};

describe('mapReportJob', () => {
  it('projects the wire job to the domain, preserving nulls', () => {
    const job = mapReportJob({
      ...jobDto,
      checksum: null,
      rowCount: null,
      failureReason: 'locked',
    });
    expect(job).toMatchObject({
      jobId: 'j1',
      checksum: null,
      rowCount: null,
      failureReason: 'locked',
      createdAtIso: '2026-07-20T09:00:00.000Z',
    });
  });
});

describe('mapReportJobsPage', () => {
  it('maps the bounded page', () => {
    const page = mapReportJobsPage({ items: [jobDto], total: 1, limit: 20, offset: 0 });
    expect(page.jobs).toHaveLength(1);
    expect(page.total).toBe(1);
  });
});

describe('mapDownloadTicket', () => {
  it('maps the signed ticket', () => {
    expect(
      mapDownloadTicket({
        url: 'https://x',
        expiresAt: '2026-07-20T09:20:00.000Z',
        checksum: 'sha256:abc',
      }),
    ).toEqual({
      url: 'https://x',
      expiresAtIso: '2026-07-20T09:20:00.000Z',
      checksum: 'sha256:abc',
    });
  });
});
