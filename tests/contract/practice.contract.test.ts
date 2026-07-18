import { assert, describe, expect, it } from 'vitest';

import {
  practiceSessionDetailSchema,
  practiceSessionListResponseSchema,
  upcomingPracticesResponseSchema,
} from '@/modules/practice';
import { safeParseWithSchema } from '@/packages/schema';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { apiUrl, authGet, loginAs } from '../setup/contract-api.helper';

describe('practice wire contract (mock mode = remote contract)', () => {
  it('serves a bounded, ordered, schema-valid calendar page', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);

    const response = await authGet('/practices/sessions?scope=upcoming&pageSize=20', token);
    expect(response.status).toBe(200);

    const parsed = safeParseWithSchema(practiceSessionListResponseSchema, await response.json());
    assert(parsed.success, 'calendar page violated the schema the app parses with');
    const starts = parsed.data.items.map((item) => item.startAt);
    expect([...starts].sort()).toEqual(starts);
  });

  it('serves a schema-valid upcoming list', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);

    const response = await authGet('/practices/sessions/upcoming', token);

    const parsed = safeParseWithSchema(upcomingPracticesResponseSchema, await response.json());
    assert(parsed.success, 'upcoming list violated the schema');
    expect(parsed.data.items.length).toBeGreaterThan(0);
  });

  it('serves a schema-valid session detail', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);

    const response = await authGet('/practices/sessions/sess-evening', token);

    const parsed = safeParseWithSchema(practiceSessionDetailSchema, await response.json());
    assert(parsed.success, 'session detail violated the schema');
    expect(parsed.data.id).toBe('sess-evening');
  });

  it('applies a self-RSVP and returns the updated detail with a bumped version', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const before = (await (await authGet('/practices/sessions/sess-evening', token)).json()) as {
      rsvp: { version: number };
    };
    const version = before.rsvp.version;

    const response = await fetch(apiUrl('/practices/sessions/sess-evening/rsvp'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'going', reasonCategory: null, version }),
    });
    expect(response.status).toBe(200);

    const parsed = safeParseWithSchema(practiceSessionDetailSchema, await response.json());
    assert(parsed.success, 'RSVP response violated the schema');
    expect(parsed.data.rsvp.status).toBe('going');
    expect(parsed.data.rsvp.version).toBe(version + 1);
  });

  it('rejects a stale RSVP write with a 409 conflict envelope', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);

    const response = await fetch(apiUrl('/practices/sessions/sess-conflict/rsvp'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'going', reasonCategory: null, version: 1 }),
    });

    expect(response.status).toBe(409);
    expect(((await response.json()) as { code: string }).code).toBe('RSVP_VERSION_CONFLICT');
  });

  it('rejects an anonymous calendar request with the NestJS envelope', async () => {
    const response = await fetch(apiUrl('/practices/sessions?scope=upcoming'));

    expect(response.status).toBe(401);
    expect(((await response.json()) as { code: string }).code).toBe('UNAUTHORIZED');
  });
});
