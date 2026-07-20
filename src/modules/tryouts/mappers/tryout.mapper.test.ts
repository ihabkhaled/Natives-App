import { describe, expect, it } from 'vitest';

import {
  MOCK_TRYOUTS,
  tryoutCandidateResponse,
  tryoutCandidatesResponse,
  tryoutEventResponse,
  tryoutEventsResponse,
} from '@/tests/msw/tryouts.fixture';

import {
  mapCandidateDetail,
  mapCandidatePage,
  mapConversionResult,
  mapRegistrationResult,
  mapTryoutEvent,
  mapTryoutEventPage,
} from './tryout.mapper';

const ALL_GRANTS = { contacts: true, readiness: true };
const NO_GRANTS = { contacts: false, readiness: false };

describe('mapTryoutEvent', () => {
  it('keeps capacity and waitlist counts exactly as reported', () => {
    const event = mapTryoutEvent(tryoutEventResponse(MOCK_TRYOUTS.openEventId)!);

    expect(event).toMatchObject({ capacity: 24, registeredCount: 4, waitlistedCount: 1 });
  });

  it('keeps a missing venue null', () => {
    expect(mapTryoutEvent(tryoutEventResponse(MOCK_TRYOUTS.fullEventId)!).venueName).toBeNull();
  });

  it('maps a full page without losing its total', () => {
    const page = mapTryoutEventPage(tryoutEventsResponse());

    expect(page.items).toHaveLength(page.total);
  });
});

describe('mapCandidatePage', () => {
  it('produces rows with no contact or readiness field at all', () => {
    const page = mapCandidatePage(tryoutCandidatesResponse());

    expect(Object.keys(page.items[0]!)).toEqual([
      'candidateId',
      'reference',
      'displayName',
      'status',
      'checkedInAt',
      'evaluationCount',
    ]);
  });
});

describe('mapCandidateDetail', () => {
  it('preserves the restricted blocks when the server sent them', () => {
    const detail = mapCandidateDetail(
      tryoutCandidateResponse(MOCK_TRYOUTS.registeredCandidateId, ALL_GRANTS)!,
    );

    expect(detail.contacts?.email).toBe('candidate.one@example.test');
    expect(detail.readiness?.note).toContain('ankle');
  });

  it('keeps them null when the server withheld them', () => {
    const detail = mapCandidateDetail(
      tryoutCandidateResponse(MOCK_TRYOUTS.registeredCandidateId, NO_GRANTS)!,
    );

    expect(detail.contacts).toBeNull();
    expect(detail.readiness).toBeNull();
  });

  it('preserves an unscored criterion as null rather than zero', () => {
    const detail = mapCandidateDetail(
      tryoutCandidateResponse(MOCK_TRYOUTS.checkedInCandidateId, ALL_GRANTS)!,
    );

    expect(detail.scores).toContainEqual({ criterion: 'catching', score: null });
    expect(detail.birthYear).toBeNull();
  });

  it('carries an existing decision and the conversion state', () => {
    const detail = mapCandidateDetail(
      tryoutCandidateResponse(MOCK_TRYOUTS.acceptedCandidateId, ALL_GRANTS)!,
    );

    expect(detail.decision?.outcome).toBe('accept');
    expect(detail.existingAccount).toBe(true);
    expect(detail.convertedMembershipId).toBeNull();
  });
});

describe('mapRegistrationResult and mapConversionResult', () => {
  it('maps the registration outcome and its reference', () => {
    expect(
      mapRegistrationResult({
        outcome: 'waitlisted',
        reference: null,
        tryoutId: 'try-1',
        consentVersion: 'v1',
      }),
    ).toEqual({ outcome: 'waitlisted', reference: null, consentVersion: 'v1' });
  });

  it('maps the conversion result including the idempotency flag', () => {
    expect(
      mapConversionResult({
        candidateId: 'cand-1',
        membershipId: 'membership-1',
        alreadyConverted: true,
      }),
    ).toEqual({ membershipId: 'membership-1', alreadyConverted: true });
  });
});
