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
