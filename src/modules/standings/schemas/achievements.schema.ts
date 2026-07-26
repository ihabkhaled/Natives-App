import {
  isoDateField,
  isoInstantField,
  pagedEnvelopeFields,
  schemaBuilder,
} from '@/packages/schema';

import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_IMPORT_OUTCOMES,
  ACHIEVEMENT_SOURCES,
  ACHIEVEMENT_STATUSES,
  ACHIEVEMENT_VISIBILITIES,
} from '../constants/standings.constants';

/**
 * Wire contracts for the achievements approval workflow, the audited import,
 * and the trophy cabinet. `rejectionReason` is nullable and only ever set by
 * the reject transition (contract 1.6.0) — reject is terminal, so the reason
 * is the claim's epitaph.
 */
export const achievementResponseSchema = schemaBuilder.object({
  achievementId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  seasonId: schemaBuilder.string().nullable(),
  competitionId: schemaBuilder.string().nullable(),
  membershipId: schemaBuilder.string().nullable(),
  category: schemaBuilder.enum(ACHIEVEMENT_CATEGORIES),
  title: schemaBuilder.string().min(1),
  description: schemaBuilder.string().nullable(),
  achievedOn: isoDateField,
  evidenceReference: schemaBuilder.string().nullable(),
  visibility: schemaBuilder.enum(ACHIEVEMENT_VISIBILITIES),
  status: schemaBuilder.enum(ACHIEVEMENT_STATUSES),
  source: schemaBuilder.enum(ACHIEVEMENT_SOURCES),
  importReference: schemaBuilder.string().nullable(),
  rejectionReason: schemaBuilder.string().nullable(),
  recordVersion: schemaBuilder.number().int().positive(),
  createdBy: schemaBuilder.string().nullable(),
  approvedBy: schemaBuilder.string().nullable(),
  approvedAt: isoInstantField.nullable(),
  rejectedAt: isoInstantField.nullable(),
  archivedAt: isoInstantField.nullable(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

export const listAchievementsResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(achievementResponseSchema),
  ...pagedEnvelopeFields,
});

export const achievementImportReportSchema = schemaBuilder.object({
  dryRun: schemaBuilder.boolean(),
  received: schemaBuilder.number().int().nonnegative(),
  imported: schemaBuilder.number().int().nonnegative(),
  skippedDuplicate: schemaBuilder.number().int().nonnegative(),
  rejectedInvalid: schemaBuilder.number().int().nonnegative(),
  rows: schemaBuilder.array(
    schemaBuilder.object({
      reference: schemaBuilder.string().min(1),
      outcome: schemaBuilder.enum(ACHIEVEMENT_IMPORT_OUTCOMES),
      achievementId: schemaBuilder.string().nullable(),
    }),
  ),
});

export const teamHistoryResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(
    schemaBuilder.object({
      achievementId: schemaBuilder.string().min(1),
      seasonId: schemaBuilder.string().nullable(),
      competitionId: schemaBuilder.string().nullable(),
      membershipId: schemaBuilder.string().nullable(),
      category: schemaBuilder.enum(ACHIEVEMENT_CATEGORIES),
      title: schemaBuilder.string().min(1),
      achievedOn: isoDateField,
      visibility: schemaBuilder.enum(ACHIEVEMENT_VISIBILITIES),
    }),
  ),
  ...pagedEnvelopeFields,
});
