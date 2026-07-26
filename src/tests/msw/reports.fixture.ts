import type {
  listReportJobsResponseSchema,
  reportDownloadResponseSchema,
  reportJobResponseSchema,
} from '@/modules/reports';
import type { SchemaOutput } from '@/packages/schema';

type JobsListDto = SchemaOutput<typeof listReportJobsResponseSchema>;
type JobDto = SchemaOutput<typeof reportJobResponseSchema>;
type DownloadDto = SchemaOutput<typeof reportDownloadResponseSchema>;

export const MOCK_REPORTS = {
  teamId: 'team-natives',
  completedJobId: 'r0000000-0000-4000-8000-000000000001',
  failedJobId: 'r0000000-0000-4000-8000-000000000002',
  expiredJobId: 'r0000000-0000-4000-8000-000000000003',
  seasonId: '50000000-0000-4000-8000-000000000001',
} as const;

const CREATED_AT = '2026-07-20T09:00:00.000Z';
const FUTURE_EXPIRY = '2026-07-30T09:00:00.000Z';
const PAST_EXPIRY = '2026-07-19T09:00:00.000Z';

function job(overrides: Partial<JobDto> & { jobId: string }): JobDto {
  return {
    teamId: MOCK_REPORTS.teamId,
    seasonId: null,
    template: 'team_overview',
    format: 'csv',
    privacyClass: 'team',
    status: 'queued',
    progress: 0,
    retryCount: 0,
    calculationVersion: 'reports-v1',
    snapshotAt: CREATED_AT,
    checksum: null,
    rowCount: null,
    failureReason: null,
    expiresAt: FUTURE_EXPIRY,
    recordVersion: 1,
    completedAt: null,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    ...overrides,
  };
}

/**
 * A stateful queued job that advances queued → running → completed over
 * successive polls, plus a standing failed job (retryable), and an expired
 * job. `pollCursor` is the number of list reads seen for the advancing job.
 */
let pollCursor = 0;
let queuedJob: JobDto | null = null;

const COMPLETED_JOB = job({
  jobId: MOCK_REPORTS.completedJobId,
  template: 'attendance',
  status: 'completed',
  progress: 100,
  checksum: 'sha256:abcdef1234567890',
  rowCount: 1245,
  completedAt: '2026-07-20T09:05:00.000Z',
});

const FAILED_JOB = job({
  jobId: MOCK_REPORTS.failedJobId,
  template: 'match_stats',
  status: 'failed',
  progress: 40,
  retryCount: 1,
  failureReason: 'Source dataset was locked during generation.',
});

const EXPIRED_JOB = job({
  jobId: MOCK_REPORTS.expiredJobId,
  template: 'roster',
  status: 'expired',
  progress: 100,
  checksum: 'sha256:0000111122223333',
  rowCount: 40,
  expiresAt: PAST_EXPIRY,
});

function advancingJob(): JobDto | null {
  if (queuedJob === null) {
    return null;
  }
  if (pollCursor >= 2) {
    return {
      ...queuedJob,
      status: 'completed',
      progress: 100,
      checksum: 'sha256:aaaabbbbccccdddd',
      rowCount: 88,
      completedAt: '2026-07-20T09:10:00.000Z',
    };
  }
  if (pollCursor === 1) {
    return { ...queuedJob, status: 'running', progress: 55 };
  }
  return queuedJob;
}

export function reportJobsResponse(template: string | null, status: string | null): JobsListDto {
  const advancing = advancingJob();
  if (advancing !== null) {
    pollCursor += 1;
  }
  const all = [advancing, COMPLETED_JOB, FAILED_JOB, EXPIRED_JOB].filter(
    (candidate): candidate is JobDto => candidate !== null,
  );
  const items = all
    .filter((candidate) => template === null || candidate.template === template)
    .filter((candidate) => status === null || candidate.status === status);
  return { items, total: items.length, limit: 20, offset: 0 };
}

/** Queue a new job; the first poll after this returns it as `queued`. */
export function generateReportJob(body: {
  template?: string;
  format?: string;
  seasonId?: string | null;
}): JobDto {
  pollCursor = 0;
  queuedJob = job({
    jobId: 'r0000000-0000-4000-8000-000000000009',
    template: (body.template ?? 'team_overview') as JobDto['template'],
    format: (body.format ?? 'csv') as JobDto['format'],
    seasonId: body.seasonId ?? null,
    status: 'queued',
  });
  return queuedJob;
}

/** Retry the failed job; it re-enters the queue. */
export function retryReportJob(jobId: string): JobDto | null {
  if (jobId !== MOCK_REPORTS.failedJobId) {
    return null;
  }
  return { ...FAILED_JOB, status: 'queued', progress: 0, retryCount: 2, failureReason: null };
}

export function reportJobRecord(jobId: string): JobDto | null {
  const all = [advancingJob(), COMPLETED_JOB, FAILED_JOB, EXPIRED_JOB];
  return all.find((candidate) => candidate?.jobId === jobId) ?? null;
}

/** A fresh 15-minute signed URL. */
export function reportDownloadTicket(): DownloadDto {
  return {
    url: 'https://reports.ultimate-natives.local/signed/abc?exp=900',
    expiresAt: '2026-07-20T09:20:00.000Z',
    checksum: 'sha256:abcdef1234567890',
  };
}

export function resetMockReportsState(): void {
  pollCursor = 0;
  queuedJob = null;
}
