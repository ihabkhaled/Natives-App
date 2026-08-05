import { http, HttpResponse } from 'msw';

import { PERMISSIONS } from '@/shared/security';

import { apiUrl, failRequest, pathParam, readJsonBody } from './mock-request.helper';
import { has } from './persona-permissions.helper';
import {
  assignMockGroupMembers,
  copyMockAgenda,
  createMockAgendaGroup,
  readMockAgendaGroupsPlan,
  removeMockAgendaGroup,
  removeMockGroupMember,
} from './practice-agenda-groups.fixture';

const BASE = '/teams/:teamId/practice-sessions/:sessionId/agenda';

interface CopyBody {
  readonly sourceSessionId?: string;
}

interface CreateGroupBody {
  readonly name?: string;
}

interface AssignMembersBody {
  readonly membershipIds?: readonly string[];
}

/**
 * NestJS-shaped practice-agenda-groups handlers.
 *
 * Every route here is `practice.manage`, unlike `practice-agenda`'s plain
 * read: the plan this reads carries private coach notes, and splitting the
 * roster into groups is a coach's roster decision, not something a member
 * attending the session has reason to see.
 */
export const practiceAgendaGroupsHandlers = [
  http.get(apiUrl(`${BASE}/plan`), ({ request }) =>
    has(request, PERMISSIONS.practicesManage)
      ? HttpResponse.json(readMockAgendaGroupsPlan())
      : failRequest(403, 'FORBIDDEN', '/practice-sessions/agenda/plan'),
  ),
  http.post(apiUrl(`${BASE}/copy`), async ({ request }) => {
    if (!has(request, PERMISSIONS.practicesManage)) {
      return failRequest(403, 'FORBIDDEN', '/practice-sessions/agenda/copy');
    }
    const body = await readJsonBody<CopyBody>(request);
    if (body.sourceSessionId === undefined || body.sourceSessionId === '') {
      return failRequest(400, 'VALIDATION_ERROR', '/practice-sessions/agenda/copy');
    }
    return HttpResponse.json(copyMockAgenda());
  }),
  http.post(apiUrl(`${BASE}/groups`), async ({ request }) => {
    if (!has(request, PERMISSIONS.practicesManage)) {
      return failRequest(403, 'FORBIDDEN', '/practice-sessions/agenda/groups');
    }
    const body = await readJsonBody<CreateGroupBody>(request);
    if (body.name === undefined || body.name === '') {
      return failRequest(400, 'VALIDATION_ERROR', '/practice-sessions/agenda/groups');
    }
    return HttpResponse.json(createMockAgendaGroup(body), { status: 201 });
  }),
  http.delete(apiUrl(`${BASE}/groups/:groupId`), ({ request, params }) => {
    if (!has(request, PERMISSIONS.practicesManage)) {
      return failRequest(403, 'FORBIDDEN', '/practice-sessions/agenda/groups');
    }
    const removed = removeMockAgendaGroup(pathParam(params, 'groupId'));
    return removed
      ? new HttpResponse(null, { status: 204 })
      : failRequest(404, 'NOT_FOUND', '/practice-sessions/agenda/groups');
  }),
  http.post(apiUrl(`${BASE}/groups/:groupId/members`), async ({ request, params }) => {
    if (!has(request, PERMISSIONS.practicesManage)) {
      return failRequest(403, 'FORBIDDEN', '/practice-sessions/agenda/groups/members');
    }
    const body = await readJsonBody<AssignMembersBody>(request);
    if (body.membershipIds === undefined || body.membershipIds.length === 0) {
      return failRequest(400, 'VALIDATION_ERROR', '/practice-sessions/agenda/groups/members');
    }
    const updated = assignMockGroupMembers(pathParam(params, 'groupId'), body);
    return updated === null
      ? failRequest(404, 'NOT_FOUND', '/practice-sessions/agenda/groups/members')
      : HttpResponse.json(updated);
  }),
  http.delete(apiUrl(`${BASE}/groups/:groupId/members/:membershipId`), ({ request, params }) => {
    if (!has(request, PERMISSIONS.practicesManage)) {
      return failRequest(403, 'FORBIDDEN', '/practice-sessions/agenda/groups/members');
    }
    const updated = removeMockGroupMember(
      pathParam(params, 'groupId'),
      pathParam(params, 'membershipId'),
    );
    return updated === null
      ? failRequest(404, 'NOT_FOUND', '/practice-sessions/agenda/groups/members')
      : HttpResponse.json(updated);
  }),
];
