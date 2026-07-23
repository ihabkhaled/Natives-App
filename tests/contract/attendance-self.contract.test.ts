import { assert, describe, expect, it } from 'vitest';

import {
  attendanceSelfHistoryResponseSchema,
  attendanceSelfRecordSchema,
  participationResponseSchema,
} from '@/modules/attendance';
import { safeParseWithSchema } from '@/packages/schema';
import { MOCK_ATTENDANCE, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { authGet, authPost, loginAs } from '../setup/contract-api.helper';

const OWN_MEMBERSHIP_ID = 'membership-natives-1';

function selfPath(suffix: string): string {
  return `/teams/${MOCK_ATTENDANCE.teamId}/practice-sessions/${MOCK_ATTENDANCE.sessionId}/attendance${suffix}`;
}

const PARTICIPATION_PATH = `/teams/${MOCK_ATTENDANCE.teamId}/attendance/me/participation`;
const HISTORY_PATH = `/teams/${MOCK_ATTENDANCE.teamId}/attendance/me/history`;

/**
 * Wire contract for the member self-service reads at contract 1.6.0: the own
 * record now always carries the server-ruled `selfCheckIn` eligibility block,
 * check-ins are windowed (409 `errors.practices.checkInWindowClosed` outside
 * it) and idempotent, and the own history endpoint pages newest-first.
 */
describe('attendance self-service wire contract (mock mode = remote contract)', () => {
  it('serves the own record with the caller membership and the eligibility block', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(selfPath('/me'), token);

    expect(response.status).toBe(200);
    const parsed = safeParseWithSchema(attendanceSelfRecordSchema, await response.json());
    assert(parsed.success, 'own record violated AttendanceResponseDto');
    expect(parsed.data.membershipId).toBe(OWN_MEMBERSHIP_ID);
    // The fixture session starts two days out: the server rules `not_open`
    // and publishes the exact window bounds for the client to render.
    assert(parsed.data.selfCheckIn !== null, 'own record read must carry the eligibility block');
    expect(parsed.data.selfCheckIn.state).toBe('not_open');
    expect(Date.parse(parsed.data.selfCheckIn.opensAt)).toBeLessThan(
      Date.parse(parsed.data.selfCheckIn.closesAt),
    );
  });

  it('refuses an out-of-window check-in with the contract message key', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authPost(selfPath('/check-in'), token, { note: 'warmup done' });

    expect(response.status).toBe(409);
    const body = (await response.json()) as { messageKey?: string };
    expect(body.messageKey).toBe('errors.practices.checkInWindowClosed');
  });

  it('serves the own participation summary with counts, rate, and cited rule', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(PARTICIPATION_PATH, token);

    expect(response.status).toBe(200);
    const parsed = safeParseWithSchema(participationResponseSchema, await response.json());
    assert(parsed.success, 'participation violated ParticipationResponseDto');
    expect(parsed.data.membershipId).toBe(OWN_MEMBERSHIP_ID);
    expect(parsed.data.ruleStatus).toBe('candidate');
  });

  it('pages the own history newest-first with the bounded envelope', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(`${HISTORY_PATH}?limit=5&offset=5`, token);

    expect(response.status).toBe(200);
    const parsed = safeParseWithSchema(attendanceSelfHistoryResponseSchema, await response.json());
    assert(parsed.success, 'history violated AttendanceSelfHistoryResponseDto');
    expect(parsed.data.limit).toBe(5);
    expect(parsed.data.offset).toBe(5);
    expect(parsed.data.items).toHaveLength(5);
    const instants = parsed.data.items.map((item) => Date.parse(item.startsAt));
    expect([...instants].sort((left, right) => right - left)).toEqual(instants);
  });

  it('clamps an oversized history limit to the contract maximum of 100', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(`${HISTORY_PATH}?limit=200`, token);

    expect(response.status).toBe(200);
    const parsed = safeParseWithSchema(attendanceSelfHistoryResponseSchema, await response.json());
    assert(parsed.success, 'clamped history violated AttendanceSelfHistoryResponseDto');
    expect(parsed.data.limit).toBe(100);
  });

  it('answers 403 for an analyst on every self route — team reads carry no self grant', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.analyst);

    expect((await authGet(selfPath('/me'), token)).status).toBe(403);
    expect((await authPost(selfPath('/check-in'), token, {})).status).toBe(403);
    expect((await authGet(PARTICIPATION_PATH, token)).status).toBe(403);
    expect((await authGet(HISTORY_PATH, token)).status).toBe(403);
  });

  it('lets an analyst read the roster while a member still cannot', async () => {
    const analystToken = await loginAs(MOCK_PERSONA_EMAILS.analyst);
    const memberToken = await loginAs(MOCK_PERSONA_EMAILS.member);

    expect((await authGet(selfPath(''), analystToken)).status).toBe(200);
    expect((await authGet(selfPath(''), memberToken)).status).toBe(403);
  });

  it('hides other teams behind a 403 for self routes too', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);

    expect(
      (await authGet('/teams/team-outside-scope/attendance/me/participation', token)).status,
    ).toBe(403);
    expect((await authGet('/teams/team-outside-scope/attendance/me/history', token)).status).toBe(
      403,
    );
  });
});
