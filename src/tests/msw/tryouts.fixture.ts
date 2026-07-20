import type {
  candidateDetailResponseSchema,
  candidateListResponseSchema,
  conversionResponseSchema,
  registrationResponseSchema,
  tryoutEventListResponseSchema,
  tryoutEventResponseSchema,
} from '@/modules/tryouts';
import type { SchemaOutput } from '@/packages/schema';

import { SEEDS } from './tryout-candidates.fixture';
import { MOCK_TRYOUTS } from './tryout-ids.fixture';

export { MOCK_TRYOUTS };

type EventDto = SchemaOutput<typeof tryoutEventResponseSchema>;
type EventListDto = SchemaOutput<typeof tryoutEventListResponseSchema>;
type CandidateListDto = SchemaOutput<typeof candidateListResponseSchema>;
type DetailDto = SchemaOutput<typeof candidateDetailResponseSchema>;
type RegistrationDto = SchemaOutput<typeof registrationResponseSchema>;
type ConversionDto = SchemaOutput<typeof conversionResponseSchema>;

const CREATED_AT = '2026-07-01T09:00:00.000Z';

const EVENTS: EventDto[] = [
  {
    tryoutId: MOCK_TRYOUTS.openEventId,
    teamId: MOCK_TRYOUTS.teamId,
    name: 'Autumn intake — session 1',
    status: 'open',
    heldAt: '2026-08-15T15:00:00.000Z',
    venueName: 'Maadi Club pitch 1',
    capacity: 24,
    registeredCount: 4,
    waitlistedCount: 1,
    consentVersion: MOCK_TRYOUTS.consentVersion,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    tryoutId: MOCK_TRYOUTS.fullEventId,
    teamId: MOCK_TRYOUTS.teamId,
    name: 'Autumn intake — session 2',
    status: 'open',
    heldAt: '2026-08-22T15:00:00.000Z',
    venueName: null,
    capacity: 2,
    registeredCount: 2,
    waitlistedCount: 3,
    consentVersion: MOCK_TRYOUTS.consentVersion,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
];

let candidates = new Map<string, DetailDto>();
let registeredEmails = new Set<string>();

export function resetMockTryoutsState(): void {
  candidates = new Map(SEEDS.map((seed) => [seed.candidate.candidateId, structuredClone(seed)]));
  registeredEmails = new Set([MOCK_TRYOUTS.duplicateEmail]);
}

resetMockTryoutsState();

export function tryoutEventsResponse(): EventListDto {
  return { items: EVENTS, total: EVENTS.length, limit: 50, offset: 0 };
}

export function tryoutEventResponse(tryoutId: string): EventDto | null {
  return EVENTS.find((item) => item.tryoutId === tryoutId) ?? null;
}

export function tryoutCandidatesResponse(): CandidateListDto {
  const items = [...candidates.values()].map((detail) => detail.candidate);
  return { items, total: items.length, limit: 100, offset: 0 };
}

/**
 * The detail projection the server would return: restricted blocks are
 * replaced with null unless the caller holds the matching grant.
 */
export function tryoutCandidateResponse(
  candidateId: string,
  grants: { readonly contacts: boolean; readonly readiness: boolean },
): DetailDto | null {
  const record = candidates.get(candidateId);
  if (record === undefined) {
    return null;
  }
  return {
    ...record,
    contacts: grants.contacts ? record.contacts : null,
    readiness: grants.readiness ? record.readiness : null,
  };
}

export function checkInCandidateRecord(candidateId: string): DetailDto | null {
  const record = candidates.get(candidateId);
  if (record === undefined) {
    return null;
  }
  const next: DetailDto = {
    ...record,
    candidate: {
      ...record.candidate,
      status: 'checked_in',
      checkedInAt: '2026-08-15T14:45:00.000Z',
    },
  };
  candidates.set(candidateId, next);
  return next;
}

export function saveEvaluationRecord(
  candidateId: string,
  scores: DetailDto['scores'],
  note: string | null,
): DetailDto | null {
  const record = candidates.get(candidateId);
  if (record === undefined) {
    return null;
  }
  const next: DetailDto = {
    ...record,
    candidate: {
      ...record.candidate,
      status: 'evaluated',
      evaluationCount: record.candidate.evaluationCount + 1,
    },
    scores,
    evaluationNote: note,
  };
  candidates.set(candidateId, next);
  return next;
}

const DECISION_STATUS = {
  accept: 'accepted',
  waitlist: 'waitlisted',
  decline: 'declined',
} as const;

export function decideCandidateRecord(
  candidateId: string,
  outcome: keyof typeof DECISION_STATUS,
  reason: string,
): DetailDto | null {
  const record = candidates.get(candidateId);
  if (record === undefined) {
    return null;
  }
  const next: DetailDto = {
    ...record,
    candidate: { ...record.candidate, status: DECISION_STATUS[outcome] },
    decision: {
      outcome,
      reason,
      decidedAt: '2026-08-16T10:00:00.000Z',
      offerExpiresAt: outcome === 'accept' ? '2026-08-30T10:00:00.000Z' : null,
    },
  };
  candidates.set(candidateId, next);
  return next;
}

/** Idempotent: a second conversion returns the same membership id. */
export function convertCandidateRecord(candidateId: string): ConversionDto | null {
  const record = candidates.get(candidateId);
  if (record === undefined) {
    return null;
  }
  const existing = record.convertedMembershipId;
  const membershipId = existing ?? `membership-${candidateId.slice(-4)}`;
  candidates.set(candidateId, {
    ...record,
    candidate: { ...record.candidate, status: 'converted' },
    convertedMembershipId: membershipId,
  });
  return { candidateId, membershipId, alreadyConverted: existing !== null };
}

export function registerCandidateRecord(
  tryoutId: string,
  email: string,
  consentGiven: boolean,
): RegistrationDto | 'consent-required' {
  if (!consentGiven) {
    return 'consent-required';
  }
  const event = EVENTS.find((item) => item.tryoutId === tryoutId);
  if (registeredEmails.has(email)) {
    return {
      outcome: 'duplicate',
      reference: null,
      tryoutId,
      consentVersion: MOCK_TRYOUTS.consentVersion,
    };
  }
  registeredEmails.add(email);
  const isFull = event !== undefined && event.registeredCount >= event.capacity;
  return {
    outcome: isFull ? 'waitlisted' : 'registered',
    reference: isFull ? null : 'UN-2026-0099',
    tryoutId,
    consentVersion: MOCK_TRYOUTS.consentVersion,
  };
}
