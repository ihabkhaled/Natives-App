import { http, HttpResponse } from 'msw';

import type { BackendApiSchemas } from '@/packages/api-contract';

import {
  applyBulkAttendance,
  applyOneAttendance,
  buildAttendanceHistory,
  buildAttendanceSheet,
  consumeReplayConflict,
  correctAttendanceRecord,
  finalizeAttendanceSheet,
} from './attendance.fixture';
import { MOCK_ATTENDANCE } from './mock-data.constants';
import { apiUrl, isAuthorized } from './mock-request.helper';
import { nestErrorResponse } from './nest-error.helper';

function attendancePath(teamId: string, sessionId: string, suffix = ''): string {
  return `/teams/${teamId}/practice-sessions/${sessionId}/attendance${suffix}`;
}

function canManage(request: Request, teamId: string): boolean {
  const authorization = request.headers.get('Authorization') ?? '';
  return (
    isAuthorized(request) &&
    teamId === MOCK_ATTENDANCE.teamId &&
    !authorization.includes('user-member')
  );
}

function denied(path: string): Response {
  return nestErrorResponse({
    statusCode: 403,
    code: 'FORBIDDEN',
    message: 'Attendance permission or team scope denied',
    path: `/api/v1${path}`,
  });
}

function conflict(path: string): Response {
  return nestErrorResponse({
    statusCode: 409,
    code: 'ATTENDANCE_VERSION_CONFLICT',
    message: 'Attendance was changed elsewhere',
    path: `/api/v1${path}`,
  });
}

function parseNumber(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export const attendanceHandlers = [
  http.get(
    apiUrl('/teams/:teamId/practice-sessions/:sessionId/attendance'),
    ({ request, params }) => {
      const teamId = String(params['teamId']);
      const sessionId = String(params['sessionId']);
      const path = attendancePath(teamId, sessionId);
      if (!canManage(request, teamId)) {
        return denied(path);
      }
      const url = new URL(request.url);
      return HttpResponse.json(
        buildAttendanceSheet(
          parseNumber(url.searchParams.get('limit'), 20),
          parseNumber(url.searchParams.get('offset'), 0),
        ),
      );
    },
  ),
  http.post(
    apiUrl('/teams/:teamId/practice-sessions/:sessionId/attendance/bulk'),
    async ({ request, params }) => {
      const teamId = String(params['teamId']);
      const sessionId = String(params['sessionId']);
      const path = attendancePath(teamId, sessionId, '/bulk');
      if (!canManage(request, teamId)) {
        return denied(path);
      }
      const body = (await request.json()) as BackendApiSchemas['BulkMarkAttendanceDto'];
      const result = applyBulkAttendance(body.marks);
      return result === null ? conflict(path) : HttpResponse.json(result);
    },
  ),
  http.put(
    apiUrl('/teams/:teamId/practice-sessions/:sessionId/attendance/:membershipId'),
    async ({ request, params }) => {
      const teamId = String(params['teamId']);
      const sessionId = String(params['sessionId']);
      const membershipId = String(params['membershipId']);
      const path = attendancePath(teamId, sessionId, `/${membershipId}`);
      if (!canManage(request, teamId)) {
        return denied(path);
      }
      const body = (await request.json()) as BackendApiSchemas['MarkAttendanceDto'];
      const result = consumeReplayConflict(membershipId)
        ? null
        : applyOneAttendance(membershipId, body);
      return result === null ? conflict(path) : HttpResponse.json(result);
    },
  ),
  http.post(
    apiUrl('/teams/:teamId/practice-sessions/:sessionId/attendance/finalize'),
    async ({ request, params }) => {
      const teamId = String(params['teamId']);
      const sessionId = String(params['sessionId']);
      const path = attendancePath(teamId, sessionId, '/finalize');
      if (!canManage(request, teamId)) {
        return denied(path);
      }
      const body = (await request.json()) as BackendApiSchemas['FinalizeAttendanceDto'];
      const result = finalizeAttendanceSheet(body.expectedVersion);
      return result === null ? conflict(path) : HttpResponse.json(result);
    },
  ),
  http.put(
    apiUrl('/teams/:teamId/practice-sessions/:sessionId/attendance/:membershipId/correction'),
    async ({ request, params }) => {
      const teamId = String(params['teamId']);
      const sessionId = String(params['sessionId']);
      const membershipId = String(params['membershipId']);
      const path = attendancePath(teamId, sessionId, `/${membershipId}/correction`);
      if (!canManage(request, teamId)) {
        return denied(path);
      }
      const body = (await request.json()) as BackendApiSchemas['CorrectAttendanceDto'];
      const result = correctAttendanceRecord(membershipId, body);
      return result === null ? conflict(path) : HttpResponse.json(result);
    },
  ),
  http.get(
    apiUrl('/teams/:teamId/practice-sessions/:sessionId/attendance/:membershipId/history'),
    ({ request, params }) => {
      const teamId = String(params['teamId']);
      const sessionId = String(params['sessionId']);
      const membershipId = String(params['membershipId']);
      const path = attendancePath(teamId, sessionId, `/${membershipId}/history`);
      return canManage(request, teamId)
        ? HttpResponse.json(buildAttendanceHistory(membershipId))
        : denied(path);
    },
  ),
];
