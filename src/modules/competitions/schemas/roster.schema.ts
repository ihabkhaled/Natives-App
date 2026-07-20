import { isoInstantField, pagedEnvelopeFields, schemaBuilder } from '@/packages/schema';

import { AVAILABILITY_VALUES } from '../constants/competitions.constants';
import {
  ENTRY_ROLES,
  ENTRY_STATUSES,
  FIELD_POSITIONS,
  GENDER_BUCKETS,
  LINE_ASSIGNMENTS,
  ROSTER_DIVISIONS,
  ROSTER_KINDS,
  ROSTER_STATUSES,
  SNAPSHOT_REASONS,
  VIOLATION_CODES,
  VIOLATION_SEVERITIES,
} from '../constants/rosters.constants';

/**
 * Wire contracts for the backend rosters module. `jerseyNumber` and
 * `availability` stay nullable: a rostered player with no number reports null
 * and the table says "unassigned" rather than printing 0.
 */

export const rosterResponseSchema = schemaBuilder.object({
  rosterId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  seasonId: schemaBuilder.string().min(1),
  competitionId: schemaBuilder.string().min(1),
  fixtureId: schemaBuilder.string().nullable(),
  squadId: schemaBuilder.string().nullable(),
  rosterKind: schemaBuilder.enum(ROSTER_KINDS),
  name: schemaBuilder.string().min(1),
  status: schemaBuilder.enum(ROSTER_STATUSES),
  division: schemaBuilder.enum(ROSTER_DIVISIONS),
  minSize: schemaBuilder.number().int().nonnegative(),
  maxSize: schemaBuilder.number().int().nonnegative(),
  minWomen: schemaBuilder.number().int().nullable(),
  requireCaptain: schemaBuilder.boolean(),
  policyVersion: schemaBuilder.string().min(1),
  selectionDeadline: isoInstantField.nullable(),
  notes: schemaBuilder.string().nullable(),
  revision: schemaBuilder.number().int().nonnegative(),
  recordVersion: schemaBuilder.number().int(),
  revisionReason: schemaBuilder.string().nullable(),
  publishedAt: isoInstantField.nullable(),
  lockedAt: isoInstantField.nullable(),
  revisedAt: isoInstantField.nullable(),
  archivedAt: isoInstantField.nullable(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

export const rosterListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(rosterResponseSchema),
  ...pagedEnvelopeFields,
});

export const rosterEntryResponseSchema = schemaBuilder.object({
  entryId: schemaBuilder.string().min(1),
  rosterId: schemaBuilder.string().min(1),
  membershipId: schemaBuilder.string().min(1),
  jerseyNumber: schemaBuilder.number().int().nullable(),
  entryRole: schemaBuilder.enum(ENTRY_ROLES),
  lineAssignment: schemaBuilder.enum(LINE_ASSIGNMENTS),
  fieldPosition: schemaBuilder.enum(FIELD_POSITIONS),
  genderBucket: schemaBuilder.enum(GENDER_BUCKETS),
  status: schemaBuilder.enum(ENTRY_STATUSES),
  availability: schemaBuilder.enum(AVAILABILITY_VALUES).nullable(),
  selectionReason: schemaBuilder.string().nullable(),
  constraintOverridden: schemaBuilder.boolean(),
  overrideReason: schemaBuilder.string().nullable(),
  removalReason: schemaBuilder.string().nullable(),
  removedAt: isoInstantField.nullable(),
  recordVersion: schemaBuilder.number().int(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

export const rosterEntryListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(rosterEntryResponseSchema),
  ...pagedEnvelopeFields,
});

const compositionSchema = schemaBuilder.object({
  selected: schemaBuilder.number().int().nonnegative(),
  women: schemaBuilder.number().int().nonnegative(),
  men: schemaBuilder.number().int().nonnegative(),
  mixed: schemaBuilder.number().int().nonnegative(),
  unknownGender: schemaBuilder.number().int().nonnegative(),
  offense: schemaBuilder.number().int().nonnegative(),
  defense: schemaBuilder.number().int().nonnegative(),
  flexible: schemaBuilder.number().int().nonnegative(),
  captains: schemaBuilder.number().int().nonnegative(),
  spiritCaptains: schemaBuilder.number().int().nonnegative(),
  missingJersey: schemaBuilder.number().int().nonnegative(),
  duplicateJerseys: schemaBuilder.number().int().nonnegative(),
  unavailableSelected: schemaBuilder.number().int().nonnegative(),
});

const violationSchema = schemaBuilder.object({
  code: schemaBuilder.enum(VIOLATION_CODES),
  severity: schemaBuilder.enum(VIOLATION_SEVERITIES),
  count: schemaBuilder.number().int().nullable(),
});

export const rosterValidationResponseSchema = schemaBuilder.object({
  rosterId: schemaBuilder.string().min(1),
  policyVersion: schemaBuilder.string().min(1),
  status: schemaBuilder.enum(ROSTER_STATUSES),
  composition: compositionSchema,
  violations: schemaBuilder.array(violationSchema),
  publishable: schemaBuilder.boolean(),
});

const snapshotResponseSchema = schemaBuilder.object({
  snapshotId: schemaBuilder.string().min(1),
  rosterId: schemaBuilder.string().min(1),
  revision: schemaBuilder.number().int().nonnegative(),
  reason: schemaBuilder.enum(SNAPSHOT_REASONS),
  rosterStatus: schemaBuilder.enum(ROSTER_STATUSES),
  entryCount: schemaBuilder.number().int().nonnegative(),
  checksum: schemaBuilder.string().min(1),
  takenAt: isoInstantField,
});

export const rosterSnapshotListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(snapshotResponseSchema),
  ...pagedEnvelopeFields,
});
