import { isoInstantField, pagedEnvelopeFields, schemaBuilder } from '@/packages/schema';

import {
  AVAILABILITY_SOURCES,
  AVAILABILITY_VALUES,
  ELIGIBILITY_SIGNAL_CODES,
  ELIGIBILITY_STATUSES,
  SELECTION_ROLES,
  SELECTION_STATUSES,
  SQUAD_STATUSES,
} from '../constants/competitions.constants';

/**
 * Wire contracts for the backend squads module. `attendancePct` and
 * `jerseyNumber` stay nullable and `availability` stays nullable: a candidate
 * with no recorded attendance reports `null`, which the UI renders as "not
 * enough data" and never as 0%.
 */

export const squadResponseSchema = schemaBuilder.object({
  squadId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  seasonId: schemaBuilder.string().min(1),
  competitionId: schemaBuilder.string().nullable(),
  name: schemaBuilder.string().min(1),
  status: schemaBuilder.enum(SQUAD_STATUSES),
  attendanceThresholdPct: schemaBuilder.number(),
  policyVersion: schemaBuilder.string().min(1),
  selectionDeadline: isoInstantField.nullable(),
  notes: schemaBuilder.string().nullable(),
  revision: schemaBuilder.number().int().nonnegative(),
  recordVersion: schemaBuilder.number().int(),
  publishedAt: isoInstantField.nullable(),
  lockedAt: isoInstantField.nullable(),
  archivedAt: isoInstantField.nullable(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

export const squadListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(squadResponseSchema),
  ...pagedEnvelopeFields,
});

const eligibilitySignalSchema = schemaBuilder.object({
  code: schemaBuilder.enum(ELIGIBILITY_SIGNAL_CODES),
  status: schemaBuilder.enum(ELIGIBILITY_STATUSES),
});

const memberEligibilitySchema = schemaBuilder.object({
  membershipId: schemaBuilder.string().min(1),
  fullName: schemaBuilder.string().min(1),
  jerseyNumber: schemaBuilder.number().int().nullable(),
  attendancePct: schemaBuilder.number().nullable(),
  availability: schemaBuilder.enum(AVAILABILITY_VALUES).nullable(),
  selected: schemaBuilder.boolean(),
  signals: schemaBuilder.array(eligibilitySignalSchema),
  overall: schemaBuilder.enum(ELIGIBILITY_STATUSES),
  flagged: schemaBuilder.boolean(),
});

const genderRatioSchema = schemaBuilder.object({
  men: schemaBuilder.number().int().nonnegative(),
  women: schemaBuilder.number().int().nonnegative(),
  mixed: schemaBuilder.number().int().nonnegative(),
  unknown: schemaBuilder.number().int().nonnegative(),
  total: schemaBuilder.number().int().nonnegative(),
  balanced: schemaBuilder.boolean(),
});

export const eligibilityReportResponseSchema = schemaBuilder.object({
  squadId: schemaBuilder.string().min(1),
  policyVersion: schemaBuilder.string().min(1),
  attendanceThresholdPct: schemaBuilder.number(),
  candidates: schemaBuilder.array(memberEligibilitySchema),
  selectedGenderRatio: genderRatioSchema,
  ...pagedEnvelopeFields,
});

export const selectionResponseSchema = schemaBuilder.object({
  selectionId: schemaBuilder.string().min(1),
  squadId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  membershipId: schemaBuilder.string().min(1),
  selectionRole: schemaBuilder.enum(SELECTION_ROLES),
  status: schemaBuilder.enum(SELECTION_STATUSES),
  reason: schemaBuilder.string().nullable(),
  eligibilityOverridden: schemaBuilder.boolean(),
  overrideReason: schemaBuilder.string().nullable(),
  eligibilitySnapshot: schemaBuilder.string(),
  removedAt: isoInstantField.nullable(),
  recordVersion: schemaBuilder.number().int(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

export const selectionListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(selectionResponseSchema),
  ...pagedEnvelopeFields,
});

export const availabilityResponseSchema = schemaBuilder.object({
  availabilityId: schemaBuilder.string().min(1),
  squadId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  membershipId: schemaBuilder.string().min(1),
  availability: schemaBuilder.enum(AVAILABILITY_VALUES),
  reason: schemaBuilder.string().nullable(),
  source: schemaBuilder.enum(AVAILABILITY_SOURCES),
  recordVersion: schemaBuilder.number().int(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

export const availabilityListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(availabilityResponseSchema),
  ...pagedEnvelopeFields,
});
