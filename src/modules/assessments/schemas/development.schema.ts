import { schemaBuilder } from '@/packages/schema';

/** Exact runtime mirrors of the generated NestJS feedback + goal DTOs. */
const isoInstant = schemaBuilder.iso.datetime({ offset: true });

const feedbackStatusSchema = schemaBuilder.enum(['draft', 'in_review', 'published', 'revised']);

export const sharedFeedbackResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  membershipId: schemaBuilder.string().min(1),
  status: feedbackStatusSchema,
  revision: schemaBuilder.number().int(),
  positiveFrisbee: schemaBuilder.string().nullable(),
  frisbeeImprovement: schemaBuilder.string().nullable(),
  positiveMental: schemaBuilder.string().nullable(),
  mentalImprovement: schemaBuilder.string().nullable(),
  teamRole: schemaBuilder.string().nullable(),
  recommendedPosition: schemaBuilder.string().nullable(),
  summary: schemaBuilder.string().nullable(),
  publishedAt: isoInstant.nullable(),
  acknowledgedAt: isoInstant.nullable(),
  clarificationRequested: schemaBuilder.boolean(),
});

export const sharedFeedbackListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(sharedFeedbackResponseSchema),
  total: schemaBuilder.number().int().nonnegative(),
  limit: schemaBuilder.number().int().positive(),
  offset: schemaBuilder.number().int().nonnegative(),
});

export const feedbackAcknowledgementResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  feedbackId: schemaBuilder.string().min(1),
  membershipId: schemaBuilder.string().min(1),
  userId: schemaBuilder.string().min(1),
  acknowledgedAt: isoInstant,
  clarificationRequested: schemaBuilder.boolean(),
  clarificationNote: schemaBuilder.string().nullable(),
});

const goalActionResponseSchema = schemaBuilder.object({
  description: schemaBuilder.string(),
  sortOrder: schemaBuilder.number().int(),
  done: schemaBuilder.boolean(),
  dueDate: schemaBuilder.string().nullable(),
});

const goalRecordResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  membershipId: schemaBuilder.string().min(1),
  title: schemaBuilder.string(),
  description: schemaBuilder.string().nullable(),
  measurableTarget: schemaBuilder.string().nullable(),
  targetValue: schemaBuilder.number().nullable(),
  baselineValue: schemaBuilder.number().nullable(),
  progressValue: schemaBuilder.number().nullable(),
  progressNote: schemaBuilder.string().nullable(),
  evidence: schemaBuilder.string().nullable(),
  status: schemaBuilder.enum(['proposed', 'active', 'achieved', 'missed', 'cancelled']),
  dueDate: schemaBuilder.string().nullable(),
  completedAt: isoInstant.nullable(),
  recordVersion: schemaBuilder.number().int(),
});

export const developmentGoalResponseSchema = schemaBuilder.object({
  goal: goalRecordResponseSchema,
  actions: schemaBuilder.array(goalActionResponseSchema),
});

export const developmentGoalListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(developmentGoalResponseSchema),
  total: schemaBuilder.number().int().nonnegative(),
  limit: schemaBuilder.number().int().positive(),
  offset: schemaBuilder.number().int().nonnegative(),
});
