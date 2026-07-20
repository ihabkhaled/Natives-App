import { assert, describe, expect, it } from 'vitest';

import {
  candidateDetailResponseSchema,
  candidateListResponseSchema,
  conversionResponseSchema,
  registrationResponseSchema,
  tryoutEventListResponseSchema,
  tryoutEventResponseSchema,
} from '@/modules/tryouts';
import { safeParseWithSchema } from '@/packages/schema';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import { MOCK_TRYOUTS } from '@/tests/msw/tryouts.fixture';

import { apiUrl, authGet, authPost, loginAs, teamScopedPath } from '../setup/contract-api.helper';

function teamPath(suffix: string): string {
  return teamScopedPath(MOCK_TRYOUTS.teamId, `/tryouts${suffix}`);
}

function candidatePath(candidateId: string, suffix = ''): string {
  return teamPath(`/${MOCK_TRYOUTS.openEventId}/candidates/${candidateId}${suffix}`);
}

/**
 * The tryouts service is not deployed yet (prompts 600/601). These tests pin
 * the wire contract the client is written against so the switch to remote is
 * a configuration change; see docs/api-verification.md.
 */
describe('public tryout contract (backend-pending)', () => {
  it('serves the open event list without a session', async () => {
    const response = await fetch(apiUrl('/public/tryout-events'));
    expect(response.status).toBe(200);

    const parsed = safeParseWithSchema(tryoutEventListResponseSchema, await response.json());
    assert(parsed.success, 'public list violated ListTryoutEventsResponseDto');
    expect(parsed.data.items.length).toBe(2);
  });

  it('registers a consenting candidate and returns a reference', async () => {
    const response = await fetch(apiUrl('/public/tryout-registrations'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tryoutId: MOCK_TRYOUTS.openEventId,
        fullName: 'Contract Candidate',
        preferredName: null,
        email: 'contract@example.test',
        phone: null,
        birthYear: null,
        consentVersion: MOCK_TRYOUTS.consentVersion,
        consentGiven: true,
      }),
    });
    expect(response.status).toBe(201);

    const parsed = safeParseWithSchema(registrationResponseSchema, await response.json());
    assert(parsed.success, 'registration violated RegistrationResponseDto');
    expect(parsed.data.outcome).toBe('registered');
    expect(parsed.data.consentVersion).toBe(MOCK_TRYOUTS.consentVersion);
  });

  it('refuses a registration that carries no consent', async () => {
    const response = await fetch(apiUrl('/public/tryout-registrations'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tryoutId: MOCK_TRYOUTS.openEventId,
        email: 'no-consent@example.test',
        consentGiven: false,
      }),
    });

    expect(response.status).toBe(400);
  });

  it('reports a duplicate registration instead of creating a second record', async () => {
    const response = await fetch(apiUrl('/public/tryout-registrations'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tryoutId: MOCK_TRYOUTS.openEventId,
        email: MOCK_TRYOUTS.duplicateEmail,
        consentGiven: true,
      }),
    });

    const parsed = safeParseWithSchema(registrationResponseSchema, await response.json());
    assert(parsed.success, 'duplicate violated RegistrationResponseDto');
    expect(parsed.data.outcome).toBe('duplicate');
    expect(parsed.data.reference).toBeNull();
  });
});

describe('staff tryout contract (backend-pending)', () => {
  it('serves the event list and one event', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const list = await authGet(teamPath(''), token);
    const detail = await authGet(teamPath(`/${MOCK_TRYOUTS.openEventId}`), token);

    assert(
      safeParseWithSchema(tryoutEventListResponseSchema, await list.json()).success,
      'list violated ListTryoutEventsResponseDto',
    );
    assert(
      safeParseWithSchema(tryoutEventResponseSchema, await detail.json()).success,
      'detail violated TryoutEventResponseDto',
    );
  });

  it('serves a candidate roll with no contact or readiness field on any row', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(teamPath(`/${MOCK_TRYOUTS.openEventId}/candidates`), token);
    const body = (await response.json()) as unknown;

    const parsed = safeParseWithSchema(candidateListResponseSchema, body);
    assert(parsed.success, 'roll violated ListCandidatesResponseDto');
    expect(JSON.stringify(body)).not.toContain('@example.test');
  });

  it('withholds contacts and readiness from a caller without those grants', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(candidatePath(MOCK_TRYOUTS.registeredCandidateId), token);

    const parsed = safeParseWithSchema(candidateDetailResponseSchema, await response.json());
    assert(parsed.success, 'detail violated CandidateDetailResponseDto');
    expect(parsed.data.contacts).toBeNull();
    expect(parsed.data.readiness).toBeNull();
  });

  it('serves contacts and readiness to a caller who holds both grants', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const response = await authGet(candidatePath(MOCK_TRYOUTS.registeredCandidateId), token);

    const parsed = safeParseWithSchema(candidateDetailResponseSchema, await response.json());
    assert(parsed.success, 'detail violated CandidateDetailResponseDto');
    expect(parsed.data.contacts?.email).toBe('candidate.one@example.test');
    expect(parsed.data.readiness).not.toBeNull();
  });

  it('keeps an unscored evaluation criterion null on the wire', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const response = await authPost(
      candidatePath(MOCK_TRYOUTS.registeredCandidateId, '/evaluations'),
      token,
      {
        scores: [
          { criterion: 'throwing', score: 4 },
          { criterion: 'catching', score: null },
          { criterion: 'movement', score: null },
          { criterion: 'attitude', score: null },
        ],
        note: null,
      },
    );

    const parsed = safeParseWithSchema(candidateDetailResponseSchema, await response.json());
    assert(parsed.success, 'evaluation violated CandidateDetailResponseDto');
    expect(parsed.data.scores).toContainEqual({ criterion: 'catching', score: null });
  });

  it('refuses an evaluation from a caller without the evaluator grant', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authPost(
      candidatePath(MOCK_TRYOUTS.registeredCandidateId, '/evaluations'),
      token,
      { scores: [], note: null },
    );

    expect(response.status).toBe(403);
  });

  it('refuses a decision without a reason and accepts one with it', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const rejected = await authPost(
      candidatePath(MOCK_TRYOUTS.checkedInCandidateId, '/decision'),
      token,
      { outcome: 'accept', reason: 'no' },
    );
    expect(rejected.status).toBe(400);

    const accepted = await authPost(
      candidatePath(MOCK_TRYOUTS.checkedInCandidateId, '/decision'),
      token,
      { outcome: 'accept', reason: 'Consistent across every drill.' },
    );
    const parsed = safeParseWithSchema(candidateDetailResponseSchema, await accepted.json());
    assert(parsed.success, 'decision violated CandidateDetailResponseDto');
    expect(parsed.data.decision?.offerExpiresAt).not.toBeNull();
  });

  it('refuses a decision from a caller without the decide grant', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authPost(
      candidatePath(MOCK_TRYOUTS.checkedInCandidateId, '/decision'),
      token,
      { outcome: 'decline', reason: 'Not this round.' },
    );

    expect(response.status).toBe(403);
  });

  it('converts idempotently, reporting the second call as already converted', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const first = await authPost(
      candidatePath(MOCK_TRYOUTS.acceptedCandidateId, '/conversion'),
      token,
      {},
    );
    const second = await authPost(
      candidatePath(MOCK_TRYOUTS.acceptedCandidateId, '/conversion'),
      token,
      {},
    );

    const parsedFirst = safeParseWithSchema(conversionResponseSchema, await first.json());
    const parsedSecond = safeParseWithSchema(conversionResponseSchema, await second.json());
    assert(parsedFirst.success && parsedSecond.success, 'conversion violated its DTO');
    expect(parsedFirst.data.alreadyConverted).toBe(false);
    expect(parsedSecond.data.alreadyConverted).toBe(true);
    expect(parsedSecond.data.membershipId).toBe(parsedFirst.data.membershipId);
  });

  it('rejects an unauthenticated staff read', async () => {
    const response = await authGet(teamPath(''), '');

    expect(response.status).toBe(401);
  });
});
