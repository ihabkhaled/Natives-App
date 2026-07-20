import type { SchemaOutput } from '@/packages/schema';

import type {
  activityTypeListResponseSchema,
  buddyResponseSchema,
  evidenceListResponseSchema,
  reviewDetailResponseSchema,
  reviewQueueResponseSchema,
  reviewSubmissionResponseSchema,
  submissionDetailResponseSchema,
  submissionListResponseSchema,
  submissionResponseSchema,
} from '../schemas/activity.schema';
import type {
  ActivityType,
  ActivityTypeCatalog,
  ReviewQueuePage,
  ReviewSubmission,
  ReviewSubmissionDetail,
  TrainingBuddy,
  TrainingEvidence,
  TrainingSubmission,
  TrainingSubmissionDetail,
  TrainingSubmissionPage,
} from '../types/training.types';

type TypeListDto = SchemaOutput<typeof activityTypeListResponseSchema>;
type SubmissionDto = SchemaOutput<typeof submissionResponseSchema>;
type SubmissionDetailDto = SchemaOutput<typeof submissionDetailResponseSchema>;
type SubmissionListDto = SchemaOutput<typeof submissionListResponseSchema>;
type BuddyDto = SchemaOutput<typeof buddyResponseSchema>;
type EvidenceListDto = SchemaOutput<typeof evidenceListResponseSchema>;
type ReviewSubmissionDto = SchemaOutput<typeof reviewSubmissionResponseSchema>;
type ReviewDetailDto = SchemaOutput<typeof reviewDetailResponseSchema>;
type ReviewQueueDto = SchemaOutput<typeof reviewQueueResponseSchema>;

function mapActivityType(dto: TypeListDto['items'][number]): ActivityType {
  return {
    id: dto.id,
    typeKey: dto.typeKey,
    name: dto.name,
    description: dto.description,
    category: dto.category,
    unit: dto.unit,
    candidatePointValue: dto.defaultPointValue,
    pointsApproval: dto.pointsApproval,
    requiresEvidence: dto.requiresEvidence,
    minDurationMinutes: dto.minDurationMinutes,
    maxDurationMinutes: dto.maxDurationMinutes,
    catalogVersion: dto.catalogVersion,
  };
}

/** Catalog projection: the candidate value is carried through untouched. */
export function mapActivityTypeCatalog(dto: TypeListDto): ActivityTypeCatalog {
  return { items: dto.items.map(mapActivityType), total: dto.total };
}

function mapBuddy(dto: BuddyDto): TrainingBuddy {
  return {
    id: dto.id,
    submissionId: dto.submissionId,
    membershipId: dto.membershipId,
    status: dto.status,
    respondedAtIso: dto.respondedAt,
    createdAtIso: dto.createdAt,
  };
}

/** The fields the member projection and the reviewer projection share. */
function mapSubmissionCore(dto: SubmissionDto | ReviewSubmissionDto) {
  return {
    id: dto.id,
    teamId: dto.teamId,
    seasonId: dto.seasonId,
    membershipId: dto.membershipId,
    activityTypeId: dto.activityTypeId,
    status: dto.status,
    performedOn: dto.performedOn,
    durationMinutes: dto.durationMinutes,
    quantity: dto.quantity,
    notes: dto.notes,
    recordVersion: dto.recordVersion,
    submittedAtIso: dto.submittedAt,
    createdAtIso: dto.createdAt,
    updatedAtIso: dto.updatedAt,
  };
}

function mapSubmission(dto: SubmissionDto): TrainingSubmission {
  return { ...mapSubmissionCore(dto), withdrawnAtIso: dto.withdrawnAt };
}

export function mapSubmissionDetail(dto: SubmissionDetailDto): TrainingSubmissionDetail {
  return {
    submission: mapSubmission(dto.submission),
    buddies: dto.buddies.map(mapBuddy),
    evidenceCount: dto.evidenceCount,
  };
}

export function mapSubmissionPage(dto: SubmissionListDto): TrainingSubmissionPage {
  return {
    items: dto.items.map(mapSubmissionDetail),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset,
  };
}

export function mapEvidenceList(dto: EvidenceListDto): readonly TrainingEvidence[] {
  return dto.items.map((item) => ({
    id: item.id,
    submissionId: item.submissionId,
    kind: item.kind,
    storageReference: item.storageReference,
    contentType: item.contentType,
    byteSize: item.byteSize,
    description: item.description,
    scanStatus: item.scanStatus,
    createdAtIso: item.createdAt,
  }));
}

function mapReviewSubmission(dto: ReviewSubmissionDto): ReviewSubmission {
  return {
    ...mapSubmissionCore(dto),
    submitterUserId: dto.submitterUserId,
    reviewNote: dto.reviewNote,
    reviewedAtIso: dto.reviewedAt,
    reviewedBy: dto.reviewedBy,
    reviewerUserId: dto.reviewerUserId,
    reversalReason: dto.reversalReason,
    reversedAtIso: dto.reversedAt,
  };
}

export function mapReviewDetail(dto: ReviewDetailDto): ReviewSubmissionDetail {
  return {
    submission: mapReviewSubmission(dto.submission),
    buddies: dto.buddies.map(mapBuddy),
    evidenceCount: dto.evidenceCount,
    signals: dto.signals,
  };
}

export function mapReviewQueue(dto: ReviewQueueDto): ReviewQueuePage {
  return {
    items: dto.items.map(mapReviewSubmission),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset,
  };
}
