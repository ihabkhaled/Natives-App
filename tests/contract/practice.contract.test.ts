import { assert, describe, expect, it } from 'vitest';

import {
  practiceRsvpResponseSchema,
  practiceSessionListResponseSchema,
  practiceSessionResponseSchema,
} from '@/modules/practice';
import { safeParseWithSchema } from '@/packages/schema';
import { MOCK_PERSONA_EMAILS, MOCK_PRACTICE } from '@/tests/msw/mock-data.constants';

import { apiUrl, authGet, loginAs } from '../setup/contract-api.helper';

function practicePath(suffix = ''): string {
  return `/teams/${MOCK_PRACTICE.teamId}/practice-sessions${suffix}`;
}

describe('practice wire contract (mock mode = remote contract)', () => {
  it('serves the canonical offset list envelope in deterministic order', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);

    const response = await authGet(`${practicePath()}?limit=20&offset=0`, token);
    expect(response.status).toBe(200);

    const parsed = safeParseWithSchema(practiceSessionListResponseSchema, await response.json());
    assert(parsed.success, 'calendar page violated ListSessionsResponseDto');
    const starts = parsed.data.items.map((item) => item.startsAt);
    expect([...starts].sort()).toEqual(starts);
    expect(parsed.data.limit).toBe(20);
    expect(parsed.data.offset).toBe(0);
  });

  it('serves the canonical session and self-RSVP resources separately', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const suffix = `/${MOCK_PRACTICE.sessionId}`;

    const sessionResponse = await authGet(practicePath(suffix), token);
    const session = safeParseWithSchema(
      practiceSessionResponseSchema,
      await sessionResponse.json(),
    );
    assert(session.success, 'session detail violated SessionResponseDto');
    expect(session.data.id).toBe(MOCK_PRACTICE.sessionId);

    const rsvpResponse = await authGet(practicePath(`${suffix}/rsvp`), token);
    const rsvp = safeParseWithSchema(practiceRsvpResponseSchema, await rsvpResponse.json());
    assert(rsvp.success, 'self RSVP violated RsvpResponseDto');
    expect(rsvp.data.sessionId).toBe(MOCK_PRACTICE.sessionId);
  });

  it('applies SetRsvpDto and returns RsvpResponseDto', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const path = practicePath(`/${MOCK_PRACTICE.sessionId}/rsvp`);
    const beforeResponse = await authGet(path, token);
    const before = safeParseWithSchema(practiceRsvpResponseSchema, await beforeResponse.json());
    assert(before.success, 'initial RSVP violated RsvpResponseDto');

    const response = await fetch(apiUrl(path), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        status: 'going',
        expectedVersion: before.data.version ?? undefined,
      }),
    });
    expect(response.status).toBe(200);

    const parsed = safeParseWithSchema(practiceRsvpResponseSchema, await response.json());
    assert(parsed.success, 'RSVP update violated RsvpResponseDto');
    expect(parsed.data.status).toBe('going');
    expect(parsed.data.version).toBe((before.data.version ?? 0) + 1);
  });

  it('rejects payloads from the removed invented frontend contract', () => {
    expect(
      safeParseWithSchema(practiceSessionListResponseSchema, {
        items: [],
        page: 1,
        pageSize: 20,
        total: 0,
        hasMore: false,
      }).success,
    ).toBe(false);
    expect(
      safeParseWithSchema(practiceRsvpResponseSchema, {
        status: 'going',
        reasonCategory: null,
        version: 1,
      }).success,
    ).toBe(false);
  });

  it('rejects an anonymous team calendar request with the NestJS envelope', async () => {
    const response = await fetch(apiUrl(practicePath()));

    expect(response.status).toBe(401);
    expect(((await response.json()) as { code: string }).code).toBe('UNAUTHORIZED');
  });
});
