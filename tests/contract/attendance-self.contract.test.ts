import { assert, describe, expect, it } from 'vitest';

import { attendanceSelfRecordSchema, participationResponseSchema } from '@/modules/attendance';
import { safeParseWithSchema } from '@/packages/schema';
import { MOCK_ATTENDANCE, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { authGet, authPost, loginAs } from '../setup/contract-api.helper';

const OWN_MEMBERSHIP_ID = 'membership-natives-1';

function selfPath(suffix: string): string {
  return `/teams/${MOCK_ATTENDANCE.teamId}/practice-sessions/${MOCK_ATTENDANCE.sessionId}/attendance${suffix}`;
}

const PARTICIPATION_PATH = `/teams/${MOCK_ATTENDANCE.teamId}/attendance/me/participation`;

/**
 * Wire contract for the Wave F0 member self-service reads: the endpoints that
 * are already deployed today (`…/attendance/me`, check-in, own participation).
 * The self-history endpoint and the `selfCheckIn` block are Wave B1 — they are
 * deliberately NOT asserted here.
 */
describe('attendance self-service wire contract (mock mode = remote contract)', () => {
  it('serves the own record with the caller membership and tolerates no selfCheckIn block', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authGet(selfPath('/me'), token);

    expect(response.status).toBe(200);
    const parsed = safeParseWithSchema(attendanceSelfRecordSchema, await response.json());
    assert(parsed.success, 'own record violated AttendanceResponseDto');
    expect(parsed.data.membershipId).toBe(OWN_MEMBERSHIP_ID);
    expect(parsed.data.selfCheckIn).toBeUndefined();
  });

  it('derives the check-in status on the server and returns the own record', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);
    const response = await authPost(selfPath('/check-in'), token, { note: 'warmup done' });

    expect(response.status).toBe(200);
    const parsed = safeParseWithSchema(attendanceSelfRecordSchema, await response.json());
    assert(parsed.success, 'check-in violated AttendanceResponseDto');
    expect(parsed.data.membershipId).toBe(OWN_MEMBERSHIP_ID);
    expect(parsed.data.source).toBe('self');
    expect(parsed.data.status).not.toBeNull();
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

  it('answers 403 for an analyst on every self route — team reads carry no self grant', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.analyst);

    expect((await authGet(selfPath('/me'), token)).status).toBe(403);
    expect((await authPost(selfPath('/check-in'), token, {})).status).toBe(403);
    expect((await authGet(PARTICIPATION_PATH, token)).status).toBe(403);
  });

  it('lets an analyst read the roster while a member still cannot', async () => {
    const analystToken = await loginAs(MOCK_PERSONA_EMAILS.analyst);
    const memberToken = await loginAs(MOCK_PERSONA_EMAILS.member);

    expect((await authGet(selfPath(''), analystToken)).status).toBe(200);
    expect((await authGet(selfPath(''), memberToken)).status).toBe(403);
  });

  it('hides other teams behind a 403 for self routes too', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.member);

    const response = await authGet('/teams/team-outside-scope/attendance/me/participation', token);
    expect(response.status).toBe(403);
  });
});
