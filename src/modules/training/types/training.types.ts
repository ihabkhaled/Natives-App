import type {
  ActivityCategory,
  BuddyStatus,
  EvidenceKind,
  EvidenceScanStatus,
  PointsApproval,
  ReviewDecision as ReviewDecisionValue,
  ReviewSignal,
  SubmissionStatus,
} from '../constants/training.constants';

/**
 * App-owned external-training domain. The backend owns every points decision:
 * the client shows the catalog's CANDIDATE value and never computes an award.
 * `null` means "not stated" and is never coerced to zero.
 */
export interface ActivityType {
  readonly id: string;
  readonly typeKey: string;
  readonly name: string;
  readonly description: string;
  readonly category: ActivityCategory;
  /** Measurement unit for `quantity`, or null when the type is time-only. */
  readonly unit: string | null;
  /** Catalog candidate value. Null means the type carries no published value. */
  readonly candidatePointValue: number | null;
  /** `pending` means the value is unapproved and must never be shown as a number. */
  readonly pointsApproval: PointsApproval;
  readonly requiresEvidence: boolean;
  readonly minDurationMinutes: number | null;
  readonly maxDurationMinutes: number | null;
  readonly catalogVersion: number;
}

export interface TrainingBuddy {
  readonly id: string;
  readonly submissionId: string;
  readonly membershipId: string;
  readonly status: BuddyStatus;
  /** Instant the buddy answered (UTC ISO 8601), or null while pending. */
  readonly respondedAtIso: string | null;
  readonly createdAtIso: string;
}

export interface TrainingEvidence {
  readonly id: string;
  readonly submissionId: string;
  readonly kind: EvidenceKind;
  /** Opaque storage reference. Raw bytes never live in web storage. */
  readonly storageReference: string;
  readonly contentType: string | null;
  readonly byteSize: number | null;
  readonly description: string | null;
  readonly scanStatus: EvidenceScanStatus;
  readonly createdAtIso: string;
}

export interface TrainingSubmission {
  readonly id: string;
  readonly teamId: string;
  readonly seasonId: string | null;
  readonly membershipId: string;
  readonly activityTypeId: string;
  readonly status: SubmissionStatus;
  /** Calendar date the session happened (YYYY-MM-DD, team timezone). */
  readonly performedOn: string;
  readonly durationMinutes: number | null;
  readonly quantity: number | null;
  readonly notes: string | null;
  /** Optimistic-concurrency token echoed back on every mutation. */
  readonly recordVersion: number;
  readonly submittedAtIso: string | null;
  readonly withdrawnAtIso: string | null;
  readonly createdAtIso: string;
  readonly updatedAtIso: string;
}

export interface TrainingSubmissionDetail {
  readonly submission: TrainingSubmission;
  readonly buddies: readonly TrainingBuddy[];
  readonly evidenceCount: number;
}

export interface TrainingSubmissionPage {
  readonly items: readonly TrainingSubmissionDetail[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

/** The reviewer projection: the member-facing record plus the review trail. */
export interface ReviewSubmission extends Omit<TrainingSubmission, 'withdrawnAtIso'> {
  readonly submitterUserId: string;
  readonly reviewNote: string | null;
  readonly reviewedAtIso: string | null;
  readonly reviewedBy: string | null;
  readonly reviewerUserId: string | null;
  readonly reversalReason: string | null;
  readonly reversedAtIso: string | null;
}

export interface ReviewSubmissionDetail {
  readonly submission: ReviewSubmission;
  readonly buddies: readonly TrainingBuddy[];
  readonly evidenceCount: number;
  /** Advisory prompts only — the reviewer, never the client, decides. */
  readonly signals: readonly ReviewSignal[];
}

export interface ReviewQueuePage {
  readonly items: readonly ReviewSubmission[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

export interface ActivityTypeCatalog {
  readonly items: readonly ActivityType[];
  readonly total: number;
}

/** Evidence metadata the composer sends; the bytes are uploaded elsewhere. */
interface EvidenceDraft {
  readonly kind: EvidenceKind;
  readonly storageReference: string;
  readonly description: string | null;
}

/** Move a claim into or out of the review queue, with its version token. */
export interface SubmissionTransition {
  readonly submissionId: string;
  readonly expectedRecordVersion: number;
  readonly intent: 'submit' | 'withdraw';
}

/** One reviewer decision with its note and its version token. */
export interface ReviewDecisionCommand {
  readonly submissionId: string;
  readonly decision: ReviewDecisionValue;
  readonly reviewNote: string | null;
  readonly expectedRecordVersion: number;
}

/** Everything the composer collects before a create or update call. */
export interface SubmissionDraft {
  readonly activityTypeId: string;
  readonly performedOn: string;
  readonly durationMinutes: number | null;
  readonly quantity: number | null;
  readonly notes: string | null;
  readonly buddyMembershipIds: readonly string[];
  readonly evidence: readonly EvidenceDraft[];
}
