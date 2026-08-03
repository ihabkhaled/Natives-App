import { isoInstantField, pagedEnvelopeFields, schemaBuilder } from '@/packages/schema';

import {
  MEETING_RECURRENCES,
  MEETING_STATUSES,
  MEETING_VISIBILITIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from '../constants/governance.constants';

/**
 * Wire contracts for board governance, shared by remote NestJS mode and MSW
 * mock mode.
 *
 * `visibility` is enforced server-side — the list already excludes what the
 * caller may not see — but it is parsed here too because the screen labels
 * each record with who it is visible to, and a board member needs to know
 * before quoting a decision.
 */
export const governanceMeetingResponseSchema = schemaBuilder.object({
  meetingId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  title: schemaBuilder.string().min(1),
  scheduledAt: isoInstantField,
  agenda: schemaBuilder.string().nullable(),
  minutes: schemaBuilder.string().nullable(),
  decisions: schemaBuilder.array(schemaBuilder.string()),
  visibility: schemaBuilder.enum(MEETING_VISIBILITIES),
  status: schemaBuilder.enum(MEETING_STATUSES),
  recurrence: schemaBuilder.enum(MEETING_RECURRENCES),
  recordVersion: schemaBuilder.number().int().positive(),
  minutesApprovedBy: schemaBuilder.string().nullable(),
  minutesApprovedAt: schemaBuilder.string().nullable(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

export const listGovernanceMeetingsResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(governanceMeetingResponseSchema),
  ...pagedEnvelopeFields,
});

export const governanceTaskResponseSchema = schemaBuilder.object({
  taskId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  meetingId: schemaBuilder.string().nullable(),
  title: schemaBuilder.string().min(1),
  description: schemaBuilder.string().nullable(),
  ownerMembershipId: schemaBuilder.string().nullable(),
  dueDate: schemaBuilder.string().nullable(),
  priority: schemaBuilder.enum(TASK_PRIORITIES),
  status: schemaBuilder.enum(TASK_STATUSES),
  dependsOnTaskId: schemaBuilder.string().nullable(),
  recordVersion: schemaBuilder.number().int().positive(),
  completedAt: schemaBuilder.string().nullable(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

export const listGovernanceTasksResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(governanceTaskResponseSchema),
  ...pagedEnvelopeFields,
});
