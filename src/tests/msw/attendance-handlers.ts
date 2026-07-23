import { http, HttpResponse } from 'msw';

import type { BackendApiSchemas } from '@/packages/api-contract';
import { PERMISSIONS, type Permission } from '@/shared/security';

import {
  applyBulkAttendance,
  applyOneAttendance,
  applySelfCheckIn,
  buildAttendanceHistory,
  buildAttendanceSheet,
  buildMyAttendance,
  buildMyParticipation,
  consumeReplayConflict,
  correctAttendanceRecord,
  finalizeAttendanceSheet,
} from './attendance.fixture';
import { MOCK_ATTENDANCE } from './mock-data.constants';
import { apiUrl } from './mock-request.helper';
import { nestErrorResponse } from './nest-error.helper';
import { permissionsForRequest } from './persona-permissions.helper';

function attendancePath(teamId: string, sessionId: string, suffix = ''): string {
  return `/teams/${teamId}/practice-sessions/${sessionId}/attendance${suffix}`;
}

/**
 * Authorize exactly the way the backend does: by the caller's effective
 * permission, not by their role name. The team scope check keeps cross-team
 * probes answering 403 like the real guard.
 */
function isAllowed(request: Request, teamId: string, permission: Permission): boolean {
  return teamId === MOCK_ATTENDANCE.teamId && permissionsForRequest(request).includes(permission);
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

const coachHandlers = [
  http.get(
    apiUrl('/teams/:teamId/practice-sessions/:sessionId/attendance'),
    ({ request, params }) => {
      const teamId = String(params['teamId']);
      const sessionId = String(params['sessionId']);
      const path = attendancePath(teamId, sessionId);
      if (!isAllowed(request, teamId, PERMISSIONS.attendanceReadTeam)) {
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
      if (!isAllowed(request, teamId, PERMISSIONS.attendanceMark)) {
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
      if (!isAllowed(request, teamId, PERMISSIONS.attendanceMark)) {
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
      if (!isAllowed(request, teamId, PERMISSIONS.attendanceFinalize)) {
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
      if (!isAllowed(request, teamId, PERMISSIONS.attendanceCorrect)) {
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
      return isAllowed(request, teamId, PERMISSIONS.attendanceReadTeam)
        ? HttpResponse.json(buildAttendanceHistory(membershipId))
        : denied(path);
    },
  ),
];

/**
 * Member self-service routes. All three are gated on `attendance.read.self`
 * exactly like the deployed controllers, so an analyst persona (team reads,
 * no self grants) receives an honest 403 — never data belonging to someone.
 */
const selfHandlers = [
  http.get(
    apiUrl('/teams/:teamId/practice-sessions/:sessionId/attendance/me'),
    ({ request, params }) => {
      const teamId = String(params['teamId']);
      const sessionId = String(params['sessionId']);
      const path = attendancePath(teamId, sessionId, '/me');
      return isAllowed(request, teamId, PERMISSIONS.attendanceReadSelf)
        ? HttpResponse.json(buildMyAttendance(sessionId))
        : denied(path);
    },
  ),
  http.post(
    apiUrl('/teams/:teamId/practice-sessions/:sessionId/attendance/check-in'),
    ({ request, params }) => {
      const teamId = String(params['teamId']);
      const sessionId = String(params['sessionId']);
      const path = attendancePath(teamId, sessionId, '/check-in');
      return isAllowed(request, teamId, PERMISSIONS.attendanceReadSelf)
        ? HttpResponse.json(applySelfCheckIn(sessionId))
        : denied(path);
    },
  ),
  http.get(apiUrl('/teams/:teamId/attendance/me/participation'), ({ request, params }) => {
    const teamId = String(params['teamId']);
    const path = `/teams/${teamId}/attendance/me/participation`;
    if (!isAllowed(request, teamId, PERMISSIONS.attendanceReadSelf)) {
      return denied(path);
    }
    const seasonId = new URL(request.url).searchParams.get('seasonId');
    return HttpResponse.json(buildMyParticipation(seasonId));
  }),
];

export const attendanceHandlers = [...coachHandlers, ...selfHandlers];
