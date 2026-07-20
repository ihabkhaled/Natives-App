import type { SchemaOutput } from '@/packages/schema';
import type {
  reviewDetailResponseSchema,
  reviewQueueResponseSchema,
  submissionDetailResponseSchema,
} from '@/modules/training';

import {
  MOCK_TRAINING,
  readSubmission,
  readSubmissions,
  submissionDetailResponse,
  writeSubmission,
} from './training.fixture';

type DetailDto = SchemaOutput<typeof submissionDetailResponseSchema>;
type ReviewDetailDto = SchemaOutput<typeof reviewDetailResponseSchema>;
type ReviewQueueDto = SchemaOutput<typeof reviewQueueResponseSchema>;
type SubmissionDto = DetailDto['submission'];

const UPDATED_AT = '2026-07-12T09:00:00.000Z';

function reviewRecord(record: SubmissionDto): ReviewDetailDto['submission'] {
  return {
    id: record.id,
    teamId: record.teamId,
    seasonId: record.seasonId,
    membershipId: record.membershipId,
    activityTypeId: record.activityTypeId,
    status: record.status,
    performedOn: record.performedOn,
    durationMinutes: record.durationMinutes,
    quantity: record.quantity,
    notes: record.notes,
    recordVersion: record.recordVersion,
    submittedAt: record.submittedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    submitterUserId: '60000000-0000-4000-8000-000000000001',
    reviewNote: record.status === 'changes_requested' ? 'Please attach the certificate.' : null,
    reviewedAt: record.status === 'changes_requested' ? UPDATED_AT : null,
    reviewedBy: null,
    reviewerUserId: null,
    reversalReason: null,
    reversedAt: null,
  };
}

const QUEUE_STATUSES = new Set([
  'submitted',
  'under_review',
  'changes_requested',
  'approved',
  'rejected',
  'reversed',
]);

export function reviewQueueResponse(status: string | null): ReviewQueueDto {
  const queued = readSubmissions()
    .filter((record) => QUEUE_STATUSES.has(record.status))
    .filter((record) => status === null || record.status === status)
    .sort((left, right) => left.performedOn.localeCompare(right.performedOn));
  return {
    items: queued.map((record) => reviewRecord(record)),
    total: queued.length,
    limit: 20,
    offset: 0,
  };
}

/** Signals are advisory: the fixture flags a backdated WFDF claim only. */
export function reviewDetailResponse(submissionId: string): ReviewDetailDto | null {
  const record = readSubmission(submissionId);
  if (record === undefined) {
    return null;
  }
  return {
    submission: reviewRecord(record),
    buddies: submissionDetailResponse(record.id)?.buddies ?? [],
    evidenceCount: submissionDetailResponse(record.id)?.evidenceCount ?? 0,
    signals:
      record.activityTypeId === MOCK_TRAINING.wfdfTypeId
        ? ['extreme_backdating', 'repeated_buddy']
        : [],
  };
}

export function decideReviewRecord(
  submissionId: string,
  decision: string,
  expectedRecordVersion: number,
): ReviewDetailDto | 'not-found' | 'conflict' {
  const record = readSubmission(submissionId);
  if (record === undefined) {
    return 'not-found';
  }
  if (record.recordVersion !== expectedRecordVersion) {
    return 'conflict';
  }
  const statusByDecision: Record<string, SubmissionDto['status']> = {
    approve: 'approved',
    reject: 'rejected',
    'request-changes': 'changes_requested',
  };
  const next: SubmissionDto = {
    ...record,
    status: statusByDecision[decision] ?? record.status,
    recordVersion: record.recordVersion + 1,
  };
  writeSubmission(next);
  return reviewDetailResponse(submissionId) ?? 'not-found';
}
