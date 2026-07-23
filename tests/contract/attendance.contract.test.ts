import { assert, describe, expect, it } from 'vitest';

import {
  attendanceHistoryResponseSchema,
  attendanceRecordResponseSchema,
  attendanceSheetResponseSchema,
  attendanceStatusResponseSchema,
  bulkAttendanceResponseSchema,
} from '@/modules/attendance';
import { safeParseWithSchema } from '@/packages/schema';
import { MOCK_ATTENDANCE, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { apiUrl, authGet, loginAs } from '../setup/contract-api.helper';

function attendancePath(suffix = ''): string {
  return `/teams/${MOCK_ATTENDANCE.teamId}/practice-sessions/${MOCK_ATTENDANCE.sessionId}/attendance${suffix}`;
}

function authWrite(
  path: string,
  token: string,
  method: 'POST' | 'PUT',
  body: unknown,
): Promise<Response> {
  return fetch(apiUrl(path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}

describe('attendance wire contract (mock mode = remote contract)', () => {
  it('serves the canonical bounded sheet without private profile fields', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authGet(`${attendancePath()}?limit=100&offset=0`, token);

    expect(response.status).toBe(200);
    const parsed = safeParseWithSchema(attendanceSheetResponseSchema, await response.json());
    assert(parsed.success, 'attendance sheet violated AttendanceSheetResponseDto');
    expect(parsed.data.items).toHaveLength(4);
    expect(parsed.data.limit).toBe(100);
    expect(parsed.data.offset).toBe(0);
    expect(parsed.data.items.some((entry) => entry.userId === null)).toBe(true);
    expect(parsed.data.items[0]).not.toHaveProperty('email');
    expect(parsed.data.items[0]).not.toHaveProperty('notes');
    expect(parsed.data.items[0]).not.toHaveProperty('evidence');
  });

  it('applies BulkMarkAttendanceDto atomically and returns BulkRecordResponseDto', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authWrite(attendancePath('/bulk'), token, 'POST', {
      marks: [
        {
          membershipId: MOCK_ATTENDANCE.presentMembershipId,
          status: 'present_late',
          latenessMinutes: 4,
          excuseCategory: null,
          expectedVersion: 1,
        },
        {
          membershipId: MOCK_ATTENDANCE.lateMembershipId,
          status: 'absent',
          latenessMinutes: null,
          excuseCategory: null,
          expectedVersion: 2,
        },
      ],
    });

    expect(response.status).toBe(200);
    const parsed = safeParseWithSchema(bulkAttendanceResponseSchema, await response.json());
    assert(parsed.success, 'bulk write violated BulkRecordResponseDto');
    expect(parsed.data.recorded).toBe(2);
    expect(parsed.data.items.map((item) => item.status)).toEqual(['present_late', 'absent']);
  });

  it('rejects the complete bulk atom on a stale member version', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const response = await authWrite(attendancePath('/bulk'), token, 'POST', {
      marks: [
        {
          membershipId: MOCK_ATTENDANCE.presentMembershipId,
          status: 'absent',
          expectedVersion: 999,
        },
        {
          membershipId: MOCK_ATTENDANCE.lateMembershipId,
          status: 'present_on_time',
          expectedVersion: 2,
        },
      ],
    });

    expect(response.status).toBe(409);
    expect((await response.json()) as object).toMatchObject({
      code: 'ATTENDANCE_VERSION_CONFLICT',
      statusCode: 409,
    });

    const sheetResponse = await authGet(attendancePath(), token);
    const sheet = safeParseWithSchema(attendanceSheetResponseSchema, await sheetResponse.json());
    assert(sheet.success, 'attendance sheet violated AttendanceSheetResponseDto');
    expect(
      sheet.data.items.find((item) => item.membershipId === MOCK_ATTENDANCE.lateMembershipId)
        ?.status,
    ).toBe('present_late');
  });

  it('finalizes as coach; correction stays Team Admin only and is audited', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.coach);
    const sheetResponse = await authGet(attendancePath(), token);
    const sheet = safeParseWithSchema(attendanceSheetResponseSchema, await sheetResponse.json());
    assert(sheet.success, 'attendance sheet violated AttendanceSheetResponseDto');
    assert(sheet.data.version !== null, 'open sheet must be versioned');

    const finalizeResponse = await authWrite(attendancePath('/finalize'), token, 'POST', {
      expectedVersion: sheet.data.version,
    });
    const finalized = safeParseWithSchema(
      attendanceStatusResponseSchema,
      await finalizeResponse.json(),
    );
    assert(finalized.success, 'finalize violated AttendanceStatusResponseDto');
    expect(finalized.data.state).toBe('finalized');

    // The Coach bundle carries attendance.finalize but NOT attendance.correct:
    // the audited correction is a Team Admin privilege (authorization matrix).
    const correctionBody = {
      status: 'excused',
      excuseCategory: 'work',
      reason: 'Approved work conflict',
      expectedVersion: 1,
    };
    const coachCorrection = await authWrite(
      attendancePath(`/${MOCK_ATTENDANCE.presentMembershipId}/correction`),
      token,
      'PUT',
      correctionBody,
    );
    expect(coachCorrection.status).toBe(403);

    const adminToken = await loginAs(MOCK_PERSONA_EMAILS.teamAdmin);
    const correctionResponse = await authWrite(
      attendancePath(`/${MOCK_ATTENDANCE.presentMembershipId}/correction`),
      adminToken,
      'PUT',
      correctionBody,
    );
    const corrected = safeParseWithSchema(
      attendanceRecordResponseSchema,
      await correctionResponse.json(),
    );
    assert(corrected.success, 'correction violated AttendanceResponseDto');
    expect(corrected.data.status).toBe('excused');

    const historyResponse = await authGet(
      attendancePath(`/${MOCK_ATTENDANCE.presentMembershipId}/history`),
      token,
    );
    const history = safeParseWithSchema(
      attendanceHistoryResponseSchema,
      await historyResponse.json(),
    );
    assert(history.success, 'history violated AttendanceHistoryResponseDto');
    expect(history.data.items[0]?.correctionReason).toBe('Approved work conflict');
  });

  it('enforces role and team scope at the mock API boundary', async () => {
    const memberToken = await loginAs(MOCK_PERSONA_EMAILS.member);
    const coachToken = await loginAs(MOCK_PERSONA_EMAILS.coach);

    const memberResponse = await authGet(attendancePath(), memberToken);
    expect(memberResponse.status).toBe(403);

    const crossTeamResponse = await authGet(
      `/teams/team-outside-scope/practice-sessions/${MOCK_ATTENDANCE.sessionId}/attendance`,
      coachToken,
    );
    expect(crossTeamResponse.status).toBe(403);

    const anonymousResponse = await fetch(apiUrl(attendancePath()));
    expect(anonymousResponse.status).toBe(403);
  });

  it('rejects an invented profile-rich sheet shape at runtime', () => {
    expect(
      safeParseWithSchema(attendanceSheetResponseSchema, {
        sessionId: MOCK_ATTENDANCE.sessionId,
        state: 'open',
        finalizedAt: null,
        version: 1,
        roster: [{ displayName: 'Invented player', rsvp: 'going' }],
        total: 1,
      }).success,
    ).toBe(false);
  });
});
