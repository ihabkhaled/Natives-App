import { schemaBuilder } from '@/packages/schema';

import {
  AGENDA_BLOCK_TYPES,
  AGENDA_COMPLETION_STATUSES,
  AGENDA_INTENSITIES,
  AGENDA_STATUSES,
} from '../constants/practice-agenda.constants';

/**
 * Wire contracts for the practice-agenda plan, shared by remote NestJS mode
 * and MSW mock mode.
 *
 * `title`, `name`, `notes` and `target` are the coach's own words, not backend
 * copy, so they are rendered verbatim rather than mapped through an i18n key.
 * Every optional server field is `nullable()` rather than `optional()`: the
 * contract marks them required-and-nullable, and "not set" must never collapse
 * into a zero-minute block.
 *
 * The agenda's `groups` array is deliberately not declared. Group assignment is
 * a separate endpoint family this module does not consume, and the parser drops
 * what it does not declare — modelling it would be dead weight.
 */
export const agendaStationResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  blockId: schemaBuilder.string().min(1),
  drillId: schemaBuilder.string().nullable(),
  groupId: schemaBuilder.string().nullable(),
  coachMembershipId: schemaBuilder.string().nullable(),
  position: schemaBuilder.number(),
  name: schemaBuilder.string(),
  repetitions: schemaBuilder.number().nullable(),
  target: schemaBuilder.string().nullable(),
  notes: schemaBuilder.string().nullable(),
  completionStatus: schemaBuilder.enum(AGENDA_COMPLETION_STATUSES),
});

export const agendaBlockResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  drillId: schemaBuilder.string().nullable(),
  position: schemaBuilder.number(),
  title: schemaBuilder.string(),
  blockType: schemaBuilder.enum(AGENDA_BLOCK_TYPES),
  offsetMinutes: schemaBuilder.number().nullable(),
  durationMinutes: schemaBuilder.number().nullable(),
  intensity: schemaBuilder.enum(AGENDA_INTENSITIES).nullable(),
  repetitions: schemaBuilder.number().nullable(),
  target: schemaBuilder.string().nullable(),
  completionStatus: schemaBuilder.enum(AGENDA_COMPLETION_STATUSES),
  completedAt: schemaBuilder.string().nullable(),
  notes: schemaBuilder.string().nullable(),
  coachNotes: schemaBuilder.string().nullable(),
  stations: schemaBuilder.array(agendaStationResponseSchema),
});

/**
 * The plan as read. `agendaId`, `status` and `version` are null until a coach
 * creates the draft, which is why an empty agenda is a legitimate answer and
 * not a 404.
 */
export const agendaResponseSchema = schemaBuilder.object({
  sessionId: schemaBuilder.string().min(1),
  agendaId: schemaBuilder.string().nullable(),
  status: schemaBuilder.enum(AGENDA_STATUSES).nullable(),
  theme: schemaBuilder.string().nullable(),
  notes: schemaBuilder.string().nullable(),
  publishedAt: schemaBuilder.string().nullable(),
  completedAt: schemaBuilder.string().nullable(),
  version: schemaBuilder.number().nullable(),
  blocks: schemaBuilder.array(agendaBlockResponseSchema),
});

/**
 * What a reorder answers with: the agenda's header, no blocks. The new
 * `version` is the reconciliation point — the client re-reads the plan rather
 * than trusting the order it optimistically drew.
 */
export const agendaSummaryResponseSchema = schemaBuilder.object({
  sessionId: schemaBuilder.string().min(1),
  agendaId: schemaBuilder.string().min(1),
  status: schemaBuilder.enum(AGENDA_STATUSES),
  theme: schemaBuilder.string().nullable(),
  notes: schemaBuilder.string().nullable(),
  publishedAt: schemaBuilder.string().nullable(),
  completedAt: schemaBuilder.string().nullable(),
  version: schemaBuilder.number(),
});
