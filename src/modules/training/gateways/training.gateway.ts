import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  activityTypesPath,
  buddyResponsePath,
  myActivityBuddiesPath,
  reviewDecisionPath,
  reviewDetailPath,
  reviewQueuePath,
  submissionEvidencePath,
  submissionPath,
  submissionSubmitPath,
  submissionWithdrawPath,
  submissionsPath,
} from '../constants/training-api.constants';
import { SUBMISSION_LIMITS } from '../constants/training.constants';
import {
  activityTypeListResponseSchema,
  buddyListResponseSchema,
  buddyResponseSchema,
  evidenceListResponseSchema,
  reviewDetailResponseSchema,
  reviewQueueResponseSchema,
  submissionDetailResponseSchema,
  submissionListResponseSchema,
} from '../schemas/activity.schema';
import type { ReviewDecisionCommand, SubmissionDraft } from '../types/training.types';

type TypeListDto = SchemaOutput<typeof activityTypeListResponseSchema>;
type BuddyListDto = SchemaOutput<typeof buddyListResponseSchema>;
type BuddyDto = SchemaOutput<typeof buddyResponseSchema>;
type SubmissionListDto = SchemaOutput<typeof submissionListResponseSchema>;
type SubmissionDetailDto = SchemaOutput<typeof submissionDetailResponseSchema>;
type EvidenceListDto = SchemaOutput<typeof evidenceListResponseSchema>;
type ReviewQueueDto = SchemaOutput<typeof reviewQueueResponseSchema>;
type ReviewDetailDto = SchemaOutput<typeof reviewDetailResponseSchema>;

/** Wire body for create/update. Absent optional values are sent as null. */
function draftBody(draft: SubmissionDraft): Record<string, unknown> {
  return {
    activityTypeId: draft.activityTypeId,
    performedOn: draft.performedOn,
    durationMinutes: draft.durationMinutes,
    quantity: draft.quantity,
    notes: draft.notes,
    buddyMembershipIds: [...draft.buddyMembershipIds],
    evidence: draft.evidence.map((item) => ({
      kind: item.kind,
      storageReference: item.storageReference,
      description: item.description,
    })),
  };
}

/** The team's activity-type catalog, bounded by the shared page size. */
export function requestActivityTypes(teamId: string): Promise<TypeListDto> {
  return getAppHttpClient().get(activityTypesPath(teamId), activityTypeListResponseSchema, {
    params: { limit: 100, offset: 0 },
  });
}

/** One bounded page of the caller's own submissions. */
export function requestMySubmissions(teamId: string): Promise<SubmissionListDto> {
  return getAppHttpClient().get(submissionsPath(teamId), submissionListResponseSchema, {
    params: { limit: SUBMISSION_LIMITS.pageSize, offset: 0 },
  });
}

export function requestSubmission(
  teamId: string,
  submissionId: string,
): Promise<SubmissionDetailDto> {
  return getAppHttpClient().get(
    submissionPath(teamId, submissionId),
    submissionDetailResponseSchema,
  );
}

export function requestCreateSubmission(
  teamId: string,
  draft: SubmissionDraft,
): Promise<SubmissionDetailDto> {
  return getAppHttpClient().post(
    submissionsPath(teamId),
    draftBody(draft),
    submissionDetailResponseSchema,
  );
}

export function requestSubmitSubmission(
  teamId: string,
  submissionId: string,
  expectedRecordVersion: number,
): Promise<SubmissionDetailDto> {
  return getAppHttpClient().post(
    submissionSubmitPath(teamId, submissionId),
    { expectedRecordVersion },
    submissionDetailResponseSchema,
  );
}

export function requestWithdrawSubmission(
  teamId: string,
  submissionId: string,
  expectedRecordVersion: number,
): Promise<SubmissionDetailDto> {
  return getAppHttpClient().post(
    submissionWithdrawPath(teamId, submissionId),
    { expectedRecordVersion },
    submissionDetailResponseSchema,
  );
}

/** Evidence metadata only; the bytes never travel through this client. */
export function requestSubmissionEvidence(
  teamId: string,
  submissionId: string,
): Promise<EvidenceListDto> {
  return getAppHttpClient().get(
    submissionEvidencePath(teamId, submissionId),
    evidenceListResponseSchema,
  );
}

/** One bounded page of buddy credits naming the caller. */
export function requestMyBuddies(teamId: string): Promise<BuddyListDto> {
  return getAppHttpClient().get(myActivityBuddiesPath(teamId), buddyListResponseSchema, {
    params: { limit: SUBMISSION_LIMITS.pageSize, offset: 0 },
  });
}

/** Confirm or decline one buddy credit; the body is empty by contract. */
export function requestBuddyResponse(
  teamId: string,
  buddyId: string,
  intent: 'confirm' | 'decline',
): Promise<BuddyDto> {
  return getAppHttpClient().post(
    buddyResponsePath(teamId, buddyId, intent),
    {},
    buddyResponseSchema,
  );
}

/** One bounded page of the review queue, optionally narrowed to a status. */
export function requestReviewQueue(teamId: string, status: string | null): Promise<ReviewQueueDto> {
  return getAppHttpClient().get(reviewQueuePath(teamId), reviewQueueResponseSchema, {
    params: {
      limit: SUBMISSION_LIMITS.pageSize,
      offset: 0,
      ...(status === null ? {} : { status }),
    },
  });
}

export function requestReviewDetail(
  teamId: string,
  submissionId: string,
): Promise<ReviewDetailDto> {
  return getAppHttpClient().get(reviewDetailPath(teamId, submissionId), reviewDetailResponseSchema);
}

/** Record one reviewer decision with its note and concurrency token. */
export function requestReviewDecision(
  teamId: string,
  command: ReviewDecisionCommand,
): Promise<ReviewDetailDto> {
  return getAppHttpClient().post(
    reviewDecisionPath(teamId, command.submissionId, command.decision),
    { reviewNote: command.reviewNote, expectedRecordVersion: command.expectedRecordVersion },
    reviewDetailResponseSchema,
  );
}
