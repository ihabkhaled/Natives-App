import { http, HttpResponse } from 'msw';

import { PERMISSIONS } from '@/shared/security';

import { MOCK_GOVERNANCE_MEETINGS, MOCK_GOVERNANCE_TASKS } from './governance.fixture';
import { apiUrl, failRequest, pathParam } from './mock-request.helper';
import { has } from './persona-permissions.helper';

const BASE = '/teams/:teamId/governance';

/**
 * NestJS-shaped governance handlers. Reading is governance.read; the real
 * server also filters each record by its own visibility, which these fixtures
 * stand in for by returning what a board member would see.
 */
export const governanceHandlers = [
  http.get(apiUrl(`${BASE}/meetings`), ({ request }) =>
    has(request, PERMISSIONS.governanceRead)
      ? HttpResponse.json({
          items: MOCK_GOVERNANCE_MEETINGS,
          total: MOCK_GOVERNANCE_MEETINGS.length,
          limit: 25,
          offset: 0,
        })
      : failRequest(403, 'FORBIDDEN', '/governance/meetings'),
  ),
  http.get(apiUrl(`${BASE}/meetings/:meetingId`), ({ request, params }) => {
    if (!has(request, PERMISSIONS.governanceRead)) {
      return failRequest(403, 'FORBIDDEN', '/governance/meeting');
    }
    const id = pathParam(params, 'meetingId');
    const found = MOCK_GOVERNANCE_MEETINGS.find((entry) => entry.meetingId === id);
    return found === undefined
      ? failRequest(404, 'NOT_FOUND', '/governance/meeting')
      : HttpResponse.json(found);
  }),
  http.get(apiUrl(`${BASE}/tasks`), ({ request }) =>
    has(request, PERMISSIONS.governanceRead)
      ? HttpResponse.json({
          items: MOCK_GOVERNANCE_TASKS,
          total: MOCK_GOVERNANCE_TASKS.length,
          limit: 25,
          offset: 0,
        })
      : failRequest(403, 'FORBIDDEN', '/governance/tasks'),
  ),
  http.get(apiUrl(`${BASE}/tasks/:taskId`), ({ request, params }) => {
    if (!has(request, PERMISSIONS.governanceRead)) {
      return failRequest(403, 'FORBIDDEN', '/governance/task');
    }
    const id = pathParam(params, 'taskId');
    const found = MOCK_GOVERNANCE_TASKS.find((entry) => entry.taskId === id);
    return found === undefined
      ? failRequest(404, 'NOT_FOUND', '/governance/task')
      : HttpResponse.json(found);
  }),
];
