import { I18N_KEYS } from '@/shared/i18n';

/**
 * The report catalog and job policy, mirrored 1:1 from the backend constants
 * (UN-701) and pinned by tests/contract/reports.contract.test.ts. The client
 * never invents job state: statuses arrive from the state machine and always
 * end terminal.
 */
export const REPORT_TEMPLATES = [
  'player_performance',
  'team_overview',
  'attendance',
  'training_leaderboard',
  'roster',
  'match_sheet',
  'match_stats',
  'analysis',
  'tryout_funnel',
  'data_quality',
] as const;
export type ReportTemplate = (typeof REPORT_TEMPLATES)[number];

export const REPORT_FORMATS = ['csv', 'xlsx', 'pdf'] as const;
export type ReportFormat = (typeof REPORT_FORMATS)[number];

export const REPORT_PRIVACY_CLASSES = ['public', 'team', 'restricted'] as const;
export type ReportPrivacyClass = (typeof REPORT_PRIVACY_CLASSES)[number];

export const REPORT_STATUSES = ['queued', 'running', 'completed', 'failed', 'expired'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

/** One catalog entry: labels, privacy class, and the format default. */
export interface ReportTemplateCatalogEntry {
  readonly template: ReportTemplate;
  readonly labelKey: string;
  readonly hintKey: string;
  readonly privacy: ReportPrivacyClass;
  readonly defaultFormat: ReportFormat;
}

/**
 * The 10 governed templates, mirroring the backend's `TEMPLATE_PRIVACY` and
 * `TEMPLATE_DEFAULT_FORMAT` maps (format falls back to CSV exactly as the
 * generator does).
 */
export const TEMPLATE_CATALOG: readonly ReportTemplateCatalogEntry[] = [
  {
    template: 'player_performance',
    labelKey: I18N_KEYS.reports.templatePlayerPerformance,
    hintKey: I18N_KEYS.reports.templatePlayerPerformanceHint,
    privacy: 'restricted',
    defaultFormat: 'pdf',
  },
  {
    template: 'team_overview',
    labelKey: I18N_KEYS.reports.templateTeamOverview,
    hintKey: I18N_KEYS.reports.templateTeamOverviewHint,
    privacy: 'team',
    defaultFormat: 'csv',
  },
  {
    template: 'attendance',
    labelKey: I18N_KEYS.reports.templateAttendance,
    hintKey: I18N_KEYS.reports.templateAttendanceHint,
    privacy: 'team',
    defaultFormat: 'csv',
  },
  {
    template: 'training_leaderboard',
    labelKey: I18N_KEYS.reports.templateTrainingLeaderboard,
    hintKey: I18N_KEYS.reports.templateTrainingLeaderboardHint,
    privacy: 'team',
    defaultFormat: 'csv',
  },
  {
    template: 'roster',
    labelKey: I18N_KEYS.reports.templateRoster,
    hintKey: I18N_KEYS.reports.templateRosterHint,
    privacy: 'team',
    defaultFormat: 'csv',
  },
  {
    template: 'match_sheet',
    labelKey: I18N_KEYS.reports.templateMatchSheet,
    hintKey: I18N_KEYS.reports.templateMatchSheetHint,
    privacy: 'public',
    defaultFormat: 'pdf',
  },
  {
    template: 'match_stats',
    labelKey: I18N_KEYS.reports.templateMatchStats,
    hintKey: I18N_KEYS.reports.templateMatchStatsHint,
    privacy: 'team',
    defaultFormat: 'csv',
  },
  {
    template: 'analysis',
    labelKey: I18N_KEYS.reports.templateAnalysis,
    hintKey: I18N_KEYS.reports.templateAnalysisHint,
    privacy: 'restricted',
    defaultFormat: 'pdf',
  },
  {
    template: 'tryout_funnel',
    labelKey: I18N_KEYS.reports.templateTryoutFunnel,
    hintKey: I18N_KEYS.reports.templateTryoutFunnelHint,
    privacy: 'restricted',
    defaultFormat: 'csv',
  },
  {
    template: 'data_quality',
    labelKey: I18N_KEYS.reports.templateDataQuality,
    hintKey: I18N_KEYS.reports.templateDataQualityHint,
    privacy: 'restricted',
    defaultFormat: 'csv',
  },
];

/**
 * Poll policy — the first `refetchInterval` in the app. 4 s while any visible
 * job is active; degraded to 15 s after 5 continuous minutes on the same job
 * (with the "safe to leave" note); paused entirely offline or hidden.
 */
export const REPORTS_POLL = {
  activeMs: 4000,
  slowMs: 15_000,
  slowAfterMs: 300_000,
} as const;

export const REPORTS_LIMITS = {
  pageSize: 20,
  maxRetries: 3,
} as const;

/** The "all" sentinel shared by the list facets and the season scope. */
export const REPORTS_FILTER_ALL = 'all';
