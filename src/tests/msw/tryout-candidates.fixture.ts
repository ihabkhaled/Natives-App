import type { TryoutCandidate } from '@/modules/tryout-candidates';
import type { candidateDetailResponseSchema, candidateListResponseSchema } from '@/modules/tryouts';
import type { SchemaOutput } from '@/packages/schema';

import { MOCK_TRYOUTS } from './tryout-ids.fixture';

type DetailDto = SchemaOutput<typeof candidateDetailResponseSchema>;
type CandidateListDto = SchemaOutput<typeof candidateListResponseSchema>;
type SummaryDto = CandidateListDto['items'][number];

const CREATED_AT = '2026-07-01T09:00:00.000Z';
const CONSENTED_AT = '2026-07-02T09:00:00.000Z';

function summary(overrides: Partial<SummaryDto> & { candidateId: string }): SummaryDto {
  return {
    tryoutId: MOCK_TRYOUTS.openEventId,
    reference: 'UN-2026-0001',
    displayName: 'Candidate One',
    status: 'registered',
    checkedInAt: null,
    evaluationCount: 0,
    createdAt: CREATED_AT,
    ...overrides,
  };
}

export /**
 * Four candidates covering the staff journey. Contact and readiness blocks
 * live only on the detail record, and the handler strips them for a caller
 * without the matching grant.
 */
const SEEDS: readonly DetailDto[] = [
  {
    candidate: summary({ candidateId: MOCK_TRYOUTS.registeredCandidateId }),
    consentVersion: MOCK_TRYOUTS.consentVersion,
    consentedAt: CONSENTED_AT,
    birthYear: 2001,
    contacts: { email: 'candidate.one@example.test', phone: '+20 100 000 0001' },
    readiness: { note: 'Recovering from an ankle sprain; cleared to run.', recordedAt: CREATED_AT },
    scores: [],
    evaluationNote: null,
    decision: null,
    convertedMembershipId: null,
    existingAccount: false,
  },
  {
    candidate: summary({
      candidateId: MOCK_TRYOUTS.checkedInCandidateId,
      reference: 'UN-2026-0002',
      displayName: 'Candidate Two',
      status: 'checked_in',
      checkedInAt: '2026-08-15T14:40:00.000Z',
      evaluationCount: 1,
    }),
    consentVersion: MOCK_TRYOUTS.consentVersion,
    consentedAt: CONSENTED_AT,
    birthYear: null,
    contacts: { email: 'candidate.two@example.test', phone: null },
    readiness: { note: null, recordedAt: null },
    scores: [
      { criterion: 'throwing', score: 4 },
      { criterion: 'catching', score: null },
      { criterion: 'movement', score: 3 },
      { criterion: 'attitude', score: null },
    ],
    evaluationNote: 'Strong forehand, needs work on the mark.',
    decision: null,
    convertedMembershipId: null,
    existingAccount: false,
  },
  {
    candidate: summary({
      candidateId: MOCK_TRYOUTS.acceptedCandidateId,
      reference: 'UN-2026-0003',
      displayName: 'Candidate Three',
      status: 'accepted',
      checkedInAt: '2026-08-15T14:35:00.000Z',
      evaluationCount: 2,
    }),
    consentVersion: MOCK_TRYOUTS.consentVersion,
    consentedAt: CONSENTED_AT,
    birthYear: 1999,
    contacts: { email: 'candidate.three@example.test', phone: '+20 100 000 0003' },
    readiness: { note: null, recordedAt: null },
    scores: [
      { criterion: 'throwing', score: 5 },
      { criterion: 'catching', score: 5 },
      { criterion: 'movement', score: 4 },
      { criterion: 'attitude', score: 5 },
    ],
    evaluationNote: 'Ready to play now.',
    decision: {
      outcome: 'accept',
      reason: 'Consistent across every drill.',
      decidedAt: '2026-08-16T09:00:00.000Z',
      offerExpiresAt: '2026-08-30T09:00:00.000Z',
    },
    convertedMembershipId: null,
    existingAccount: true,
  },
  {
    candidate: summary({
      candidateId: MOCK_TRYOUTS.convertedCandidateId,
      reference: 'UN-2026-0004',
      displayName: 'Candidate Four',
      status: 'converted',
      checkedInAt: '2026-08-15T14:30:00.000Z',
      evaluationCount: 2,
    }),
    consentVersion: MOCK_TRYOUTS.consentVersion,
    consentedAt: CONSENTED_AT,
    birthYear: 2003,
    contacts: { email: 'candidate.four@example.test', phone: null },
    readiness: { note: null, recordedAt: null },
    scores: [],
    evaluationNote: null,
    decision: {
      outcome: 'accept',
      reason: 'Accepted last week.',
      decidedAt: '2026-08-16T09:00:00.000Z',
      offerExpiresAt: null,
    },
    convertedMembershipId: 'membership-converted-1',
    existingAccount: false,
  },
];

/**
 * The team-scoped `/teams/{teamId}/tryout-candidates` contract, which is a
 * different shape from the per-event `SEEDS` above: one flat record per
 * candidate, with the contact and readiness fields inline rather than in
 * nested blocks. Both live here because both are tryout candidates; they are
 * separate constants because they are separate contracts.
 *
 * These records are UNREDACTED. The handlers strip the fields the caller may
 * not read, which is the order the real backend works in — the server decides
 * what travels. A client that assumed a restricted field is always present
 * therefore fails here rather than in front of a reviewer.
 *
 * The four rows cover the states the screen must tell apart: a complete
 * record, one where the person offered no way to contact them, one already
 * withdrawn, and one retention has already anonymized.
 */
export const MOCK_TRYOUT_CANDIDATES: readonly TryoutCandidate[] = [
  {
    candidateId: 'candidate-1',
    teamId: 'team-1',
    eventId: 'tryout-event-1',
    displayName: 'Nour El-Sayed',
    status: 'registered',
    waitlistPosition: null,
    priorSport: 'Handball',
    referralSource: 'A friend on the team',
    motivation: 'I want to play a mixed-gender sport.',
    contactChannel: 'email',
    contactReference: 'nour@example.test',
    communicationOptIn: true,
    readiness: 'ready',
    restrictedNotes: 'Recovered from an ankle sprain last season.',
    consentVersion: 'tryout-consent-v1',
    consentedAt: '2026-07-01T09:00:00.000Z',
    checkedInAt: null,
    withdrawnAt: null,
    convertedMembershipId: null,
    convertedAt: null,
    retentionExpiresAt: '2027-07-01T09:00:00.000Z',
    anonymizedAt: null,
    recordVersion: 1,
    createdAt: '2026-07-01T09:00:00.000Z',
    updatedAt: '2026-07-01T09:00:00.000Z',
  },
  {
    candidateId: 'candidate-2',
    teamId: 'team-1',
    eventId: 'tryout-event-1',
    displayName: 'Omar Fathy',
    status: 'checked_in',
    waitlistPosition: null,
    priorSport: null,
    referralSource: null,
    motivation: null,
    contactChannel: 'none',
    contactReference: null,
    communicationOptIn: false,
    readiness: 'unknown',
    restrictedNotes: null,
    consentVersion: 'tryout-consent-v1',
    consentedAt: '2026-07-02T09:00:00.000Z',
    checkedInAt: '2026-07-18T15:00:00.000Z',
    withdrawnAt: null,
    convertedMembershipId: null,
    convertedAt: null,
    retentionExpiresAt: '2027-07-02T09:00:00.000Z',
    anonymizedAt: null,
    recordVersion: 3,
    createdAt: '2026-07-02T09:00:00.000Z',
    updatedAt: '2026-07-18T15:00:00.000Z',
  },
  {
    candidateId: 'candidate-3',
    teamId: 'team-1',
    eventId: 'tryout-event-2',
    displayName: 'Salma Adel',
    status: 'withdrawn',
    waitlistPosition: null,
    priorSport: null,
    referralSource: 'Instagram',
    motivation: null,
    contactChannel: 'whatsapp',
    contactReference: '+20 100 000 0000',
    communicationOptIn: false,
    readiness: 'injured',
    restrictedNotes: 'Knee injury; cleared to return in the autumn.',
    consentVersion: 'tryout-consent-v1',
    consentedAt: '2026-06-20T09:00:00.000Z',
    checkedInAt: null,
    withdrawnAt: '2026-07-05T11:00:00.000Z',
    convertedMembershipId: null,
    convertedAt: null,
    retentionExpiresAt: '2027-06-20T09:00:00.000Z',
    anonymizedAt: null,
    recordVersion: 4,
    createdAt: '2026-06-20T09:00:00.000Z',
    updatedAt: '2026-07-05T11:00:00.000Z',
  },
  {
    candidateId: 'candidate-4',
    teamId: 'team-1',
    eventId: 'tryout-event-2',
    displayName: 'Anonymized candidate',
    status: 'no_show',
    waitlistPosition: null,
    priorSport: null,
    referralSource: null,
    motivation: null,
    contactChannel: 'none',
    contactReference: null,
    communicationOptIn: false,
    readiness: 'unknown',
    restrictedNotes: null,
    consentVersion: 'tryout-consent-v1',
    consentedAt: '2025-05-01T09:00:00.000Z',
    checkedInAt: null,
    withdrawnAt: null,
    convertedMembershipId: null,
    convertedAt: null,
    retentionExpiresAt: '2026-05-01T09:00:00.000Z',
    anonymizedAt: '2026-05-02T00:00:00.000Z',
    recordVersion: 2,
    createdAt: '2025-05-01T09:00:00.000Z',
    updatedAt: '2026-05-02T00:00:00.000Z',
  },
];

/**
 * The same record as the least-privileged caller receives it: the restricted
 * keys are absent, not nulled. Handlers and specs share this so "redacted"
 * means one thing everywhere.
 */
export function redactTryoutCandidate(candidate: TryoutCandidate): TryoutCandidate {
  const {
    contactChannel: _contactChannel,
    contactReference: _contactReference,
    communicationOptIn: _communicationOptIn,
    readiness: _readiness,
    restrictedNotes: _restrictedNotes,
    ...rest
  } = candidate;
  return rest;
}
