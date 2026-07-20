import {
  isoDateField,
  isoInstantField,
  pagedEnvelopeFields,
  schemaBuilder,
} from '@/packages/schema';

import {
  COMPETITION_STATUSES,
  COMPETITION_TYPES,
  FIXTURE_STATUSES,
  HOME_AWAY_VALUES,
  OPPONENT_STATUSES,
  STAGE_FORMATS,
} from '../constants/competitions.constants';

/**
 * Wire contracts for the backend competitions module, shared by remote NestJS
 * mode and MSW mock mode. Nullable fields stay nullable: an unscheduled
 * competition reports `startsOn: null` and is never rendered as a date of zero.
 */

export const competitionResponseSchema = schemaBuilder.object({
  competitionId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  seasonId: schemaBuilder.string().min(1),
  name: schemaBuilder.string().min(1),
  competitionType: schemaBuilder.enum(COMPETITION_TYPES),
  status: schemaBuilder.enum(COMPETITION_STATUSES),
  genderDivision: schemaBuilder.string().nullable(),
  organizerName: schemaBuilder.string().nullable(),
  externalRef: schemaBuilder.string().nullable(),
  startsOn: isoDateField.nullable(),
  endsOn: isoDateField.nullable(),
  description: schemaBuilder.string().nullable(),
  cancellationReason: schemaBuilder.string().nullable(),
  recordVersion: schemaBuilder.number().int(),
  publishedAt: isoInstantField.nullable(),
  activatedAt: isoInstantField.nullable(),
  completedAt: isoInstantField.nullable(),
  cancelledAt: isoInstantField.nullable(),
  archivedAt: isoInstantField.nullable(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

export const competitionListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(competitionResponseSchema),
  ...pagedEnvelopeFields,
});

const stageResponseSchema = schemaBuilder.object({
  stageId: schemaBuilder.string().min(1),
  competitionId: schemaBuilder.string().min(1),
  name: schemaBuilder.string().min(1),
  stageFormat: schemaBuilder.enum(STAGE_FORMATS),
  ordinal: schemaBuilder.number().int(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

const roundResponseSchema = schemaBuilder.object({
  roundId: schemaBuilder.string().min(1),
  stageId: schemaBuilder.string().min(1),
  competitionId: schemaBuilder.string().min(1),
  name: schemaBuilder.string().min(1),
  ordinal: schemaBuilder.number().int(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

export const competitionStructureResponseSchema = schemaBuilder.object({
  stages: schemaBuilder.array(stageResponseSchema),
  rounds: schemaBuilder.array(roundResponseSchema),
});

const fixtureResponseSchema = schemaBuilder.object({
  fixtureId: schemaBuilder.string().min(1),
  competitionId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  seasonId: schemaBuilder.string().nullable(),
  stageId: schemaBuilder.string().nullable(),
  roundId: schemaBuilder.string().nullable(),
  opponentId: schemaBuilder.string().min(1),
  venueId: schemaBuilder.string().nullable(),
  homeAway: schemaBuilder.enum(HOME_AWAY_VALUES),
  scheduledAt: isoInstantField,
  scheduledAtCairo: schemaBuilder.string().min(1),
  timezone: schemaBuilder.string().min(1),
  status: schemaBuilder.enum(FIXTURE_STATUSES),
  rescheduleCount: schemaBuilder.number().int().nonnegative(),
  previousScheduledAt: isoInstantField.nullable(),
  rescheduleReason: schemaBuilder.string().nullable(),
  cancellationReason: schemaBuilder.string().nullable(),
  recordVersion: schemaBuilder.number().int(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

export const fixtureListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(fixtureResponseSchema),
  ...pagedEnvelopeFields,
});

const opponentResponseSchema = schemaBuilder.object({
  opponentId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  name: schemaBuilder.string().min(1),
  shortName: schemaBuilder.string().nullable(),
  logoRef: schemaBuilder.string().nullable(),
  notes: schemaBuilder.string().nullable(),
  status: schemaBuilder.enum(OPPONENT_STATUSES),
  recordVersion: schemaBuilder.number().int(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

export const opponentListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(opponentResponseSchema),
  ...pagedEnvelopeFields,
});
