import { formatCairoDate, formatCairoDateTime } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  BUDDY_STATUS,
  BUDDY_STATUS_LABEL_KEYS,
  EVIDENCE_KIND_LABEL_KEYS,
  EVIDENCE_SCAN_LABEL_KEYS,
  EVIDENCE_SCAN_STATUS,
  POINTS_APPROVAL,
  REVIEW_SIGNAL_LABEL_KEYS,
  SUBMISSION_STATUS_LABEL_KEYS,
  SUBMISSION_STATUS_TONES,
  type EvidenceScanStatus,
  type ReviewSignal,
  type SubmissionStatus,
} from '../constants/training.constants';
import type {
  ActivityTypeOptionView,
  BuddyItemView,
  EvidenceItemView,
  ReviewSignalView,
  SubmissionSummaryView,
  TrainingOption,
} from '../types/training-view.types';
import type {
  ActivityType,
  TrainingBuddy,
  TrainingEvidence,
  TrainingSubmissionDetail,
} from '../types/training.types';

type Translate = (key: string, params?: TranslateParams) => string;

const SCAN_TONES: Record<EvidenceScanStatus, string> = {
  [EVIDENCE_SCAN_STATUS.pending]: 'medium',
  [EVIDENCE_SCAN_STATUS.clean]: 'success',
  [EVIDENCE_SCAN_STATUS.infected]: 'danger',
  [EVIDENCE_SCAN_STATUS.failed]: 'warning',
};

const BUDDY_TONES: Record<string, string> = {
  [BUDDY_STATUS.pending]: 'medium',
  [BUDDY_STATUS.confirmed]: 'success',
  [BUDDY_STATUS.declined]: 'warning',
};

/**
 * The candidate-points label. An unapproved type reports "pending" — the
 * client never guesses a number for a value the backend has not published.
 */
export function buildCandidateLabel(t: Translate, activityType: ActivityType | null): string {
  if (activityType === null) {
    return t(I18N_KEYS.training.candidatePending);
  }
  if (
    activityType.pointsApproval === POINTS_APPROVAL.pending ||
    activityType.candidatePointValue === null
  ) {
    return t(I18N_KEYS.training.candidatePending);
  }
  return t(I18N_KEYS.training.candidateValue, { points: activityType.candidatePointValue });
}

/** True only when a real, approved candidate number exists to show. */
export function hasCandidateValue(activityType: ActivityType | null): boolean {
  return (
    activityType !== null &&
    activityType.pointsApproval === POINTS_APPROVAL.approved &&
    activityType.candidatePointValue !== null
  );
}

function durationBoundsLabel(t: Translate, activityType: ActivityType): string | null {
  const { minDurationMinutes, maxDurationMinutes } = activityType;
  if (minDurationMinutes === null || maxDurationMinutes === null) {
    return null;
  }
  return t(I18N_KEYS.training.durationBounds, {
    min: minDurationMinutes,
    max: maxDurationMinutes,
  });
}

export function buildActivityTypeOptions(
  t: Translate,
  types: readonly ActivityType[],
): readonly ActivityTypeOptionView[] {
  return types.map((activityType) => ({
    value: activityType.id,
    label: `${activityType.name} — ${buildCandidateLabel(t, activityType)}`,
    candidateLabel: buildCandidateLabel(t, activityType),
    hasCandidate: hasCandidateValue(activityType),
    requiresEvidence: activityType.requiresEvidence,
    durationBoundsLabel: durationBoundsLabel(t, activityType),
  }));
}

/** "45 minutes" or the honest no-value dash when nothing was recorded. */
export function buildDurationLabel(t: Translate, minutes: number | null): string {
  return minutes === null
    ? t(I18N_KEYS.training.candidatePending)
    : `${String(minutes)} ${t(I18N_KEYS.training.durationUnit)}`;
}

export function buildStatusLabel(t: Translate, status: SubmissionStatus): string {
  return t(SUBMISSION_STATUS_LABEL_KEYS[status]);
}

export function statusTone(status: SubmissionStatus): string {
  return SUBMISSION_STATUS_TONES[status];
}

export function buildStatusOptions(
  t: Translate,
  statuses: readonly SubmissionStatus[],
  allLabelKey: string,
): readonly TrainingOption[] {
  return [
    { value: 'all', label: t(allLabelKey) },
    ...statuses.map((status) => ({ value: status, label: buildStatusLabel(t, status) })),
  ];
}

export function buildSubmissionSummary(
  t: Translate,
  locale: string,
  typeNames: ReadonlyMap<string, string>,
  detail: TrainingSubmissionDetail,
): SubmissionSummaryView {
  const { submission } = detail;
  const confirmed = detail.buddies.filter(
    (buddy) => buddy.status === BUDDY_STATUS.confirmed,
  ).length;
  return {
    id: submission.id,
    typeName: typeNames.get(submission.activityTypeId) ?? submission.activityTypeId,
    dateLabel: formatCairoDate(submission.performedOn, locale),
    durationLabel: buildDurationLabel(t, submission.durationMinutes),
    statusLabel: buildStatusLabel(t, submission.status),
    statusTone: statusTone(submission.status),
    evidenceLabel: t(I18N_KEYS.training.evidenceCount, { count: detail.evidenceCount }),
    buddyLabel:
      detail.buddies.length === 0 ? null : `${String(confirmed)}/${String(detail.buddies.length)}`,
    openLabel: t(I18N_KEYS.training.queueOpen),
  };
}

export function buildEvidenceItems(
  t: Translate,
  evidence: readonly TrainingEvidence[],
): readonly EvidenceItemView[] {
  return evidence.map((item) => ({
    id: item.id,
    kindLabel: t(EVIDENCE_KIND_LABEL_KEYS[item.kind]),
    reference: item.storageReference,
    description: item.description,
    scanLabel: t(EVIDENCE_SCAN_LABEL_KEYS[item.scanStatus]),
    scanTone: SCAN_TONES[item.scanStatus],
  }));
}

export function buildBuddyItems(
  t: Translate,
  locale: string,
  buddies: readonly TrainingBuddy[],
): readonly BuddyItemView[] {
  return buddies.map((buddy) => ({
    id: buddy.id,
    membershipId: buddy.membershipId,
    statusLabel: t(BUDDY_STATUS_LABEL_KEYS[buddy.status]),
    statusTone: BUDDY_TONES[buddy.status] ?? 'medium',
    respondedLabel:
      buddy.respondedAtIso === null ? null : formatCairoDateTime(buddy.respondedAtIso, locale),
  }));
}

/** Advisory prompts, translated. Never phrased as an accusation or a verdict. */
export function buildSignalViews(
  t: Translate,
  signals: readonly ReviewSignal[],
): readonly ReviewSignalView[] {
  return signals.map((signal) => ({
    key: signal,
    label: t(REVIEW_SIGNAL_LABEL_KEYS[signal]),
  }));
}
