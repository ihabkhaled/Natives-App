import { isoInstantField, pagedEnvelopeFields, schemaBuilder } from '@/packages/schema';

import {
  TRYOUT_CANDIDATE_CONTACT_CHANNELS,
  TRYOUT_CANDIDATE_READINESS_LEVELS,
  TRYOUT_CANDIDATE_STATUSES,
} from '../constants/tryout-candidates.constants';

/**
 * Wire contract for `TryoutCandidateResponseDto`, shared by remote NestJS mode
 * and MSW mock mode.
 *
 * PRIVACY IS ENCODED IN THE SHAPE. The OpenAPI document marks every field
 * `required`, but both read endpoints are documented "privacy redacted": the
 * backend OMITS the contact and readiness fields for a caller without
 * `tryout.contacts.read` / `tryout.readiness.read`. A schema that demanded
 * them would reject exactly the least-privileged caller's payload, so those
 * fields — and only those — are `.optional()` here.
 *
 * That gives the module the one distinction the whole screen turns on:
 *
 *   absent (`undefined`) -> the server withheld it; the caller may not read it
 *   present and `null`   -> the candidate did not supply it
 *   present with a value -> disclosed, and safe to render
 *
 * The two are never collapsed. "Withheld" and "the person left it blank" are
 * different facts about a member of the public, and showing one as the other
 * is a lie about their data.
 */
export const tryoutCandidateResponseSchema = schemaBuilder.object({
  candidateId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  eventId: schemaBuilder.string().min(1),
  displayName: schemaBuilder.string().min(1),
  status: schemaBuilder.enum(TRYOUT_CANDIDATE_STATUSES),
  waitlistPosition: schemaBuilder.number().int().nullable(),
  priorSport: schemaBuilder.string().nullable(),
  referralSource: schemaBuilder.string().nullable(),
  motivation: schemaBuilder.string().nullable(),
  consentVersion: schemaBuilder.string().min(1),
  consentedAt: isoInstantField,
  checkedInAt: isoInstantField.nullable(),
  withdrawnAt: isoInstantField.nullable(),
  convertedMembershipId: schemaBuilder.string().nullable(),
  convertedAt: isoInstantField.nullable(),
  /** Every candidate record carries its own expiry; retention anonymizes it. */
  retentionExpiresAt: isoInstantField,
  anonymizedAt: isoInstantField.nullable(),
  recordVersion: schemaBuilder.number().int().positive(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,

  // Withheld without `tryout.contacts.read`.
  contactChannel: schemaBuilder.enum(TRYOUT_CANDIDATE_CONTACT_CHANNELS).optional(),
  contactReference: schemaBuilder.string().nullable().optional(),
  communicationOptIn: schemaBuilder.boolean().optional(),

  // Withheld without `tryout.readiness.read`.
  readiness: schemaBuilder.enum(TRYOUT_CANDIDATE_READINESS_LEVELS).optional(),
  restrictedNotes: schemaBuilder.string().nullable().optional(),
});

export const listTryoutCandidatesResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(tryoutCandidateResponseSchema),
  ...pagedEnvelopeFields,
});

/**
 * The retention sweep's report. `candidateIds` names the records that were
 * anonymized, so the run is auditable rather than a bare count.
 */
export const tryoutRetentionResponseSchema = schemaBuilder.object({
  examined: schemaBuilder.number().int().nonnegative(),
  anonymized: schemaBuilder.number().int().nonnegative(),
  candidateIds: schemaBuilder.array(schemaBuilder.string()),
});
