import { schemaBuilder } from '@/packages/schema';

import {
  ACTIVITY_CATEGORIES,
  REVIEW_SIGNALS,
  SUBMISSION_STATUSES,
} from '../constants/training.constants';

/**
 * Wire contracts for the backend activities module, shared by remote NestJS
 * mode and MSW mock mode. Nullable numerics stay nullable: an unpriced
 * activity type reports `defaultPointValue: null` and is never rendered as 0.
 */
const isoDate = schemaBuilder.string().regex(/^\d{4}-\d{2}-\d{2}$/u);
const isoInstant = schemaBuilder.iso.datetime({ offset: true });

const pagedEnvelope = {
  total: schemaBuilder.number().int().nonnegative(),
  limit: schemaBuilder.number().int().positive(),
  offset: schemaBuilder.number().int().nonnegative(),
};

const activityTypeResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  typeKey: schemaBuilder.string().min(1),
  name: schemaBuilder.string().min(1),
  description: schemaBuilder.string(),
  category: schemaBuilder.enum(ACTIVITY_CATEGORIES),
  unit: schemaBuilder.string().nullable(),
  defaultPointValue: schemaBuilder.number().nullable(),
  pointsApproval: schemaBuilder.enum(['approved', 'pending']),
  requiresEvidence: schemaBuilder.boolean(),
  minDurationMinutes: schemaBuilder.number().int().nullable(),
  maxDurationMinutes: schemaBuilder.number().int().nullable(),
  catalogVersion: schemaBuilder.number().int(),
});

export const activityTypeListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(activityTypeResponseSchema),
  ...pagedEnvelope,
});

export const submissionResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  seasonId: schemaBuilder.string().nullable(),
  membershipId: schemaBuilder.string().min(1),
  activityTypeId: schemaBuilder.string().min(1),
  status: schemaBuilder.enum(SUBMISSION_STATUSES),
  performedOn: isoDate,
  durationMinutes: schemaBuilder.number().int().nullable(),
  quantity: schemaBuilder.number().nullable(),
  notes: schemaBuilder.string().nullable(),
  recordVersion: schemaBuilder.number().int().positive(),
  submittedAt: isoInstant.nullable(),
  withdrawnAt: isoInstant.nullable(),
  createdAt: isoInstant,
  updatedAt: isoInstant,
});

export const buddyResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  submissionId: schemaBuilder.string().min(1),
  membershipId: schemaBuilder.string().min(1),
  status: schemaBuilder.enum(['pending', 'confirmed', 'declined']),
  respondedAt: isoInstant.nullable(),
  createdAt: isoInstant,
});

export const submissionDetailResponseSchema = schemaBuilder.object({
  submission: submissionResponseSchema,
  buddies: schemaBuilder.array(buddyResponseSchema),
  evidenceCount: schemaBuilder.number().int().nonnegative(),
});

export const submissionListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(submissionDetailResponseSchema),
  ...pagedEnvelope,
});

const evidenceResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  submissionId: schemaBuilder.string().min(1),
  kind: schemaBuilder.enum(['link', 'file', 'note']),
  storageReference: schemaBuilder.string().min(1),
  contentType: schemaBuilder.string().nullable(),
  byteSize: schemaBuilder.number().int().nullable(),
  description: schemaBuilder.string().nullable(),
  scanStatus: schemaBuilder.enum(['pending', 'clean', 'infected', 'failed']),
  createdAt: isoInstant,
});

export const evidenceListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(evidenceResponseSchema),
  ...pagedEnvelope,
});

export const buddyListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(buddyResponseSchema),
  ...pagedEnvelope,
});

/** The reviewer projection adds the review trail the member never sees. */
export const reviewSubmissionResponseSchema = submissionResponseSchema
  .omit({ withdrawnAt: true })
  .extend({
    submitterUserId: schemaBuilder.string().min(1),
    reviewNote: schemaBuilder.string().nullable(),
    reviewedAt: isoInstant.nullable(),
    reviewedBy: schemaBuilder.string().nullable(),
    reviewerUserId: schemaBuilder.string().nullable(),
    reversalReason: schemaBuilder.string().nullable(),
    reversedAt: isoInstant.nullable(),
  });

export const reviewDetailResponseSchema = schemaBuilder.object({
  submission: reviewSubmissionResponseSchema,
  buddies: schemaBuilder.array(buddyResponseSchema),
  evidenceCount: schemaBuilder.number().int().nonnegative(),
  signals: schemaBuilder.array(schemaBuilder.enum(REVIEW_SIGNALS)),
});

export const reviewQueueResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(reviewSubmissionResponseSchema),
  ...pagedEnvelope,
});
