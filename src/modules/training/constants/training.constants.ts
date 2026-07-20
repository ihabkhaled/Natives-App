import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

/**
 * External-training domain vocabulary, mirroring the backend activities
 * module exactly. Every value is the wire value; the UI never invents a
 * status, a decision, or a signal of its own.
 */
export const SUBMISSION_STATUS = {
  draft: 'draft',
  submitted: 'submitted',
  underReview: 'under_review',
  changesRequested: 'changes_requested',
  approved: 'approved',
  rejected: 'rejected',
  withdrawn: 'withdrawn',
  reversed: 'reversed',
} as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUS)[keyof typeof SUBMISSION_STATUS];

export const SUBMISSION_STATUSES: readonly SubmissionStatus[] = Object.values(SUBMISSION_STATUS);

/** Statuses the reviewer queue can be filtered to (draft is never queued). */
export const REVIEW_QUEUE_STATUSES: readonly SubmissionStatus[] = [
  SUBMISSION_STATUS.submitted,
  SUBMISSION_STATUS.underReview,
  SUBMISSION_STATUS.changesRequested,
  SUBMISSION_STATUS.approved,
  SUBMISSION_STATUS.rejected,
  SUBMISSION_STATUS.reversed,
];

export const EVIDENCE_KIND = {
  link: 'link',
  file: 'file',
  note: 'note',
} as const;

export type EvidenceKind = (typeof EVIDENCE_KIND)[keyof typeof EVIDENCE_KIND];

export const EVIDENCE_KINDS: readonly EvidenceKind[] = Object.values(EVIDENCE_KIND);

export const EVIDENCE_SCAN_STATUS = {
  pending: 'pending',
  clean: 'clean',
  infected: 'infected',
  failed: 'failed',
} as const;

export type EvidenceScanStatus = (typeof EVIDENCE_SCAN_STATUS)[keyof typeof EVIDENCE_SCAN_STATUS];

export const BUDDY_STATUS = {
  pending: 'pending',
  confirmed: 'confirmed',
  declined: 'declined',
} as const;

export type BuddyStatus = (typeof BUDDY_STATUS)[keyof typeof BUDDY_STATUS];

export const ACTIVITY_CATEGORIES = [
  'gym',
  'running',
  'throwing',
  'pickup',
  'other_sport',
  'team_drills',
  'rules_quiz',
  'accreditation',
  'custom',
] as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

/** Whether the catalog's point value is an approved figure or still pending. */
export const POINTS_APPROVAL = {
  approved: 'approved',
  pending: 'pending',
} as const;

export type PointsApproval = (typeof POINTS_APPROVAL)[keyof typeof POINTS_APPROVAL];

export const REVIEW_DECISION = {
  approve: 'approve',
  reject: 'reject',
  requestChanges: 'request-changes',
} as const;

export type ReviewDecision = (typeof REVIEW_DECISION)[keyof typeof REVIEW_DECISION];

/** Advisory anti-abuse hints. Never a verdict — a reviewer still decides. */
export const REVIEW_SIGNALS = [
  'duplicate_day',
  'unusual_volume',
  'extreme_backdating',
  'implausible_duration',
  'repeated_buddy',
] as const;

export type ReviewSignal = (typeof REVIEW_SIGNALS)[number];

export const SUBMISSION_STATUS_LABEL_KEYS: Record<SubmissionStatus, I18nKey> = {
  [SUBMISSION_STATUS.draft]: I18N_KEYS.training.statusDraft,
  [SUBMISSION_STATUS.submitted]: I18N_KEYS.training.statusSubmitted,
  [SUBMISSION_STATUS.underReview]: I18N_KEYS.training.statusUnderReview,
  [SUBMISSION_STATUS.changesRequested]: I18N_KEYS.training.statusChangesRequested,
  [SUBMISSION_STATUS.approved]: I18N_KEYS.training.statusApproved,
  [SUBMISSION_STATUS.rejected]: I18N_KEYS.training.statusRejected,
  [SUBMISSION_STATUS.withdrawn]: I18N_KEYS.training.statusWithdrawn,
  [SUBMISSION_STATUS.reversed]: I18N_KEYS.training.statusReversed,
};

/** Ionic colour per status. Gold is reserved for achievements, never used here. */
export const SUBMISSION_STATUS_TONES: Record<SubmissionStatus, string> = {
  [SUBMISSION_STATUS.draft]: 'medium',
  [SUBMISSION_STATUS.submitted]: 'primary',
  [SUBMISSION_STATUS.underReview]: 'primary',
  [SUBMISSION_STATUS.changesRequested]: 'warning',
  [SUBMISSION_STATUS.approved]: 'success',
  [SUBMISSION_STATUS.rejected]: 'danger',
  [SUBMISSION_STATUS.withdrawn]: 'medium',
  [SUBMISSION_STATUS.reversed]: 'warning',
};

export const EVIDENCE_KIND_LABEL_KEYS: Record<EvidenceKind, I18nKey> = {
  [EVIDENCE_KIND.link]: I18N_KEYS.training.evidenceKindLink,
  [EVIDENCE_KIND.file]: I18N_KEYS.training.evidenceKindFile,
  [EVIDENCE_KIND.note]: I18N_KEYS.training.evidenceKindNote,
};

export const EVIDENCE_SCAN_LABEL_KEYS: Record<EvidenceScanStatus, I18nKey> = {
  [EVIDENCE_SCAN_STATUS.pending]: I18N_KEYS.training.evidenceScanPending,
  [EVIDENCE_SCAN_STATUS.clean]: I18N_KEYS.training.evidenceScanClean,
  [EVIDENCE_SCAN_STATUS.infected]: I18N_KEYS.training.evidenceScanInfected,
  [EVIDENCE_SCAN_STATUS.failed]: I18N_KEYS.training.evidenceScanFailed,
};

export const BUDDY_STATUS_LABEL_KEYS: Record<BuddyStatus, I18nKey> = {
  [BUDDY_STATUS.pending]: I18N_KEYS.training.buddyStatusPending,
  [BUDDY_STATUS.confirmed]: I18N_KEYS.training.buddyStatusConfirmed,
  [BUDDY_STATUS.declined]: I18N_KEYS.training.buddyStatusDeclined,
};

export const REVIEW_SIGNAL_LABEL_KEYS: Record<ReviewSignal, I18nKey> = {
  duplicate_day: I18N_KEYS.training.signalDuplicateDay,
  unusual_volume: I18N_KEYS.training.signalUnusualVolume,
  extreme_backdating: I18N_KEYS.training.signalExtremeBackdating,
  implausible_duration: I18N_KEYS.training.signalImplausibleDuration,
  repeated_buddy: I18N_KEYS.training.signalRepeatedBuddy,
};

/** Bounds the backend enforces; the form refuses to send anything outside them. */
export const SUBMISSION_LIMITS = {
  minDurationMinutes: 1,
  maxDurationMinutes: 1440,
  minQuantity: 0,
  maxQuantity: 1_000_000,
  maxNotesLength: 4000,
  maxReferenceLength: 1024,
  maxDescriptionLength: 500,
  maxReviewNoteLength: 2000,
  pageSize: 20,
} as const;
