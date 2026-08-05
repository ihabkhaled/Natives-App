import { http, HttpResponse } from 'msw';

import { PERMISSIONS } from '@/shared/security';

import { apiUrl, failRequest } from './mock-request.helper';
import { has } from './persona-permissions.helper';
import {
  dispatchMockReminders,
  readMockReminderStatus,
  testMockReminder,
} from './practice-reminders.fixture';

const BASE = '/teams/:teamId/practice-sessions/:sessionId/reminders';

/**
 * NestJS-shaped practice-reminder handlers.
 *
 * Every route is `practice.manage`. Who has not replied is roster information
 * and sending is a coach's action, so a member holding only `practice.read`
 * gets a 403 here even though they may read the same session's agenda.
 */
export const practiceRemindersHandlers = [
  http.get(apiUrl(`${BASE}/status`), ({ request }) => {
    if (!has(request, PERMISSIONS.practicesManage)) {
      return failRequest(403, 'FORBIDDEN', `${BASE}/status`);
    }
    return HttpResponse.json(readMockReminderStatus());
  }),
  http.get(apiUrl(`${BASE}/preview`), ({ request }) => {
    if (!has(request, PERMISSIONS.practicesManage)) {
      return failRequest(403, 'FORBIDDEN', `${BASE}/preview`);
    }
    return HttpResponse.json(readMockReminderStatus());
  }),
  http.post(apiUrl(`${BASE}/dispatch`), ({ request }) => {
    if (!has(request, PERMISSIONS.practicesManage)) {
      return failRequest(403, 'FORBIDDEN', `${BASE}/dispatch`);
    }
    return HttpResponse.json(dispatchMockReminders());
  }),
  http.post(apiUrl(`${BASE}/test`), ({ request }) => {
    if (!has(request, PERMISSIONS.practicesManage)) {
      return failRequest(403, 'FORBIDDEN', `${BASE}/test`);
    }
    return HttpResponse.json(testMockReminder());
  }),
];
