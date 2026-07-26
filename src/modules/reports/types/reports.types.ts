import type {
  ReportFormat,
  ReportPrivacyClass,
  ReportStatus,
  ReportTemplate,
} from '../constants/reports.constants';

/** One asynchronous generation job, exactly as the state machine reports it. */
export interface ReportJob {
  readonly jobId: string;
  readonly seasonId: string | null;
  readonly template: ReportTemplate;
  readonly format: ReportFormat;
  readonly privacyClass: ReportPrivacyClass;
  readonly status: ReportStatus;
  readonly progress: number;
  readonly retryCount: number;
  readonly calculationVersion: string;
  readonly snapshotAtIso: string;
  readonly checksum: string | null;
  readonly rowCount: number | null;
  readonly failureReason: string | null;
  readonly expiresAtIso: string;
  readonly recordVersion: number;
  readonly createdAtIso: string;
}

export interface ReportJobsPage {
  readonly jobs: readonly ReportJob[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

/** Facets of the job list read; null keeps a facet unfiltered. */
export interface ReportJobsFilters {
  readonly template: ReportTemplate | null;
  readonly status: ReportStatus | null;
}

export interface GenerateReportCommand {
  readonly template: ReportTemplate;
  readonly format: ReportFormat;
  readonly seasonId: string | null;
}

/** One minted, short-lived signed download ticket. Never cached. */
export interface ReportDownloadTicket {
  readonly url: string;
  readonly expiresAtIso: string;
  readonly checksum: string;
}
