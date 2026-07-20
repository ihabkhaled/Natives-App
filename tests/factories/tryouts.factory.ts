import type { CandidateDetail, CandidateSummary, TryoutEvent } from '@/modules/tryouts';

/** Deterministic tryout-domain builders shared by the unit tests. */
export function buildTryoutEvent(overrides: Partial<TryoutEvent> = {}): TryoutEvent {
  return {
    tryoutId: 'try-1',
    name: 'Autumn intake',
    status: 'open',
    heldAt: '2026-08-15T15:00:00.000Z',
    venueName: 'Maadi pitch 1',
    capacity: 24,
    registeredCount: 4,
    waitlistedCount: 1,
    consentVersion: 'v1',
    ...overrides,
  };
}

export function buildCandidateSummary(overrides: Partial<CandidateSummary> = {}): CandidateSummary {
  return {
    candidateId: 'cand-1',
    reference: 'UN-2026-0001',
    displayName: 'Candidate One',
    status: 'registered',
    checkedInAt: null,
    evaluationCount: 0,
    ...overrides,
  };
}

export function buildCandidateDetail(overrides: Partial<CandidateDetail> = {}): CandidateDetail {
  return {
    summary: buildCandidateSummary(),
    consentVersion: 'v1',
    consentedAt: '2026-07-02T09:00:00.000Z',
    birthYear: 2001,
    contacts: { email: 'one@example.test', phone: '+20 100 000 0001' },
    readiness: { note: 'Cleared to run.', recordedAt: null },
    scores: [],
    evaluationNote: null,
    decision: null,
    convertedMembershipId: null,
    existingAccount: false,
    ...overrides,
  };
}
