import type { SchemaOutput } from '@/packages/schema';

import type {
  listReportJobsResponseSchema,
  reportDownloadResponseSchema,
  reportJobResponseSchema,
} from '../schemas/reports.schema';
import type { ReportDownloadTicket, ReportJob, ReportJobsPage } from '../types/reports.types';

type JobDto = SchemaOutput<typeof reportJobResponseSchema>;
type JobsListDto = SchemaOutput<typeof listReportJobsResponseSchema>;
type DownloadDto = SchemaOutput<typeof reportDownloadResponseSchema>;

/**
 * Pure DTO → domain projection. Status, progress, and retry budget all arrive
 * from the job state machine — the client renders them and never invents a
 * transition of its own.
 */
export function mapReportJob(dto: JobDto): ReportJob {
  return {
    jobId: dto.jobId,
    seasonId: dto.seasonId,
    template: dto.template,
    format: dto.format,
    privacyClass: dto.privacyClass,
    status: dto.status,
    progress: dto.progress,
    retryCount: dto.retryCount,
    calculationVersion: dto.calculationVersion,
    snapshotAtIso: dto.snapshotAt,
    checksum: dto.checksum,
    rowCount: dto.rowCount,
    failureReason: dto.failureReason,
    expiresAtIso: dto.expiresAt,
    recordVersion: dto.recordVersion,
    createdAtIso: dto.createdAt,
  };
}

export function mapReportJobsPage(dto: JobsListDto): ReportJobsPage {
  return {
    jobs: dto.items.map(mapReportJob),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset,
  };
}

/** The 15-minute ticket; consumed immediately, never stored. */
export function mapDownloadTicket(dto: DownloadDto): ReportDownloadTicket {
  return { url: dto.url, expiresAtIso: dto.expiresAt, checksum: dto.checksum };
}
