import { isoInstantField, pagedEnvelopeFields, schemaBuilder } from '@/packages/schema';

import {
  CANDIDATE_STATUSES,
  DECISION_OUTCOMES,
  EVALUATION_CRITERIA,
  REGISTRATION_OUTCOMES,
  TRYOUT_EVENT_STATUSES,
} from '../constants/tryouts.constants';

/**
 * Wire contracts for the tryouts module. The same schemas validate mock mode
 * and (once prompts 600/601 ship) remote mode, so switching is configuration
 * only.
 *
 * Privacy is encoded in the shape: the candidate *summary* has no contact or
 * readiness field at all, and the detail carries them as nullable blocks the
 * server omits for a caller without `tryout.contacts.read` /
 * `tryout.readiness.read`.
 */

export const tryoutEventResponseSchema = schemaBuilder.object({
  tryoutId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  name: schemaBuilder.string().min(1),
  status: schemaBuilder.enum(TRYOUT_EVENT_STATUSES),
  heldAt: isoInstantField,
  venueName: schemaBuilder.string().nullable(),
  capacity: schemaBuilder.number().int().nonnegative(),
  registeredCount: schemaBuilder.number().int().nonnegative(),
  waitlistedCount: schemaBuilder.number().int().nonnegative(),
  consentVersion: schemaBuilder.string().min(1),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
});

export const tryoutEventListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(tryoutEventResponseSchema),
  ...pagedEnvelopeFields,
});

/** The list projection. No contact detail and no readiness note, ever. */
const candidateSummaryResponseSchema = schemaBuilder.object({
  candidateId: schemaBuilder.string().min(1),
  tryoutId: schemaBuilder.string().min(1),
  reference: schemaBuilder.string().min(1),
  displayName: schemaBuilder.string().min(1),
  status: schemaBuilder.enum(CANDIDATE_STATUSES),
  checkedInAt: isoInstantField.nullable(),
  evaluationCount: schemaBuilder.number().int().nonnegative(),
  createdAt: isoInstantField,
});

export const candidateListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(candidateSummaryResponseSchema),
  ...pagedEnvelopeFields,
});

const contactsResponseSchema = schemaBuilder.object({
  email: schemaBuilder.string().min(1),
  phone: schemaBuilder.string().nullable(),
});

const readinessResponseSchema = schemaBuilder.object({
  note: schemaBuilder.string().nullable(),
  recordedAt: isoInstantField.nullable(),
});

const evaluationScoreSchema = schemaBuilder.object({
  criterion: schemaBuilder.enum(EVALUATION_CRITERIA),
  score: schemaBuilder.number().int().nullable(),
});

const decisionResponseSchema = schemaBuilder.object({
  outcome: schemaBuilder.enum(DECISION_OUTCOMES),
  reason: schemaBuilder.string().nullable(),
  decidedAt: isoInstantField,
  offerExpiresAt: isoInstantField.nullable(),
});

export const candidateDetailResponseSchema = schemaBuilder.object({
  candidate: candidateSummaryResponseSchema,
  consentVersion: schemaBuilder.string().min(1),
  consentedAt: isoInstantField,
  birthYear: schemaBuilder.number().int().nullable(),
  contacts: contactsResponseSchema.nullable(),
  readiness: readinessResponseSchema.nullable(),
  scores: schemaBuilder.array(evaluationScoreSchema),
  evaluationNote: schemaBuilder.string().nullable(),
  decision: decisionResponseSchema.nullable(),
  convertedMembershipId: schemaBuilder.string().nullable(),
  existingAccount: schemaBuilder.boolean(),
});

export const registrationResponseSchema = schemaBuilder.object({
  outcome: schemaBuilder.enum(REGISTRATION_OUTCOMES),
  reference: schemaBuilder.string().nullable(),
  tryoutId: schemaBuilder.string().min(1),
  consentVersion: schemaBuilder.string().min(1),
});

export const conversionResponseSchema = schemaBuilder.object({
  candidateId: schemaBuilder.string().min(1),
  membershipId: schemaBuilder.string().min(1),
  alreadyConverted: schemaBuilder.boolean(),
});
