import { http, HttpResponse } from 'msw';

import { PERMISSIONS } from '@/shared/security';

import { apiUrl, failRequest, readJsonBody } from './mock-request.helper';
import { has } from './persona-permissions.helper';
import {
  archiveMockSchedule,
  createMockSchedule,
  findMockSchedule,
  generateMockSessions,
  listMockSchedules,
  updateMockSchedule,
} from './practice-schedules.fixture';

const BASE = '/teams/:teamId/practice-schedules';
const ITEM = `${BASE}/:scheduleId`;

function guard(request: Request, path: string): Response | null {
  return has(request, PERMISSIONS.practicesManage) ? null : failRequest(403, 'FORBIDDEN', path);
}

/**
 * NestJS-shaped practice-schedule handlers.
 *
 * Every route is `practice.manage` — the same grant reminders uses, since the
 * recurring pattern is a coach's configuration, not roster information.
 */
export const practiceSchedulesHandlers = [
  http.get(apiUrl(BASE), ({ request, params }) => {
    const denied = guard(request, BASE);
    if (denied !== null) {
      return denied;
    }
    return HttpResponse.json(listMockSchedules(String(params['teamId'])));
  }),
  http.post(apiUrl(BASE), async ({ request, params }) => {
    const denied = guard(request, BASE);
    if (denied !== null) {
      return denied;
    }
    const body = await readJsonBody<Record<string, unknown>>(request);
    return HttpResponse.json(createMockSchedule(String(params['teamId']), body), { status: 201 });
  }),
  http.get(apiUrl(ITEM), ({ request, params }) => {
    const denied = guard(request, ITEM);
    if (denied !== null) {
      return denied;
    }
    const schedule = findMockSchedule(String(params['scheduleId']));
    return schedule === undefined
      ? failRequest(404, 'NOT_FOUND', ITEM)
      : HttpResponse.json(schedule);
  }),
  http.patch(apiUrl(ITEM), async ({ request, params }) => {
    const denied = guard(request, ITEM);
    if (denied !== null) {
      return denied;
    }
    const body = await readJsonBody<Record<string, unknown>>(request);
    const outcome = updateMockSchedule(String(params['scheduleId']), body);
    if (outcome.kind === 'not-found') {
      return failRequest(404, 'NOT_FOUND', ITEM);
    }
    if (outcome.kind === 'conflict') {
      return failRequest(409, 'SCHEDULE_VERSION_CONFLICT', ITEM);
    }
    return HttpResponse.json(outcome.schedule);
  }),
  http.delete(apiUrl(ITEM), ({ request, params }) => {
    const denied = guard(request, ITEM);
    if (denied !== null) {
      return denied;
    }
    const archived = archiveMockSchedule(String(params['scheduleId']));
    return archived === undefined
      ? failRequest(404, 'NOT_FOUND', ITEM)
      : HttpResponse.json(archived);
  }),
  http.post(apiUrl(`${ITEM}/generate`), ({ request, params }) => {
    const denied = guard(request, `${ITEM}/generate`);
    if (denied !== null) {
      return denied;
    }
    const result = generateMockSessions(String(params['scheduleId']));
    return result === undefined
      ? failRequest(404, 'NOT_FOUND', `${ITEM}/generate`)
      : HttpResponse.json(result, { status: 201 });
  }),
];
