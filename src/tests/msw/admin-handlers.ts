import { http, HttpResponse } from 'msw';

import { PERMISSIONS } from '@/shared/security';

import {
  auditResponse,
  deadLettersResponse,
  jobHealthResponse,
  outboxMetricsResponse,
  replayEventRecord,
} from './admin-operations.fixture';
import { rulesResponse, simulationResponse, transitionRuleRecord } from './admin-rules.fixture';
import { adminSettingsHandlers } from './admin-settings-handlers';
import { apiUrl, failRequest, isAuthorized, pathParam, readJsonBody } from './mock-request.helper';
import { nestErrorResponse } from './nest-error.helper';
import { permissionsForRequest, personaFromToken } from './persona-permissions.helper';
import {
  promoteSuperAdminRecord,
  revokeSuperAdminRecord,
  superAdminsResponse,
} from './platform-admins.fixture';

interface TransitionBody {
  readonly transition?: 'approve' | 'publish' | 'retire' | 'revert';
  readonly expectedRecordVersion?: number;
}

interface SimulateBody {
  readonly membershipId?: string;
}

function teamUrl(suffix: string): string {
  return apiUrl(`/teams/:teamId${suffix}`);
}
function transitionHandler(path: string) {
  return http.post(teamUrl(path), async ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', path);
    }
    if (!permissionsForRequest(request).includes(PERMISSIONS.calculationRuleManage)) {
      return failRequest(403, 'FORBIDDEN', path);
    }
    const body = await readJsonBody<TransitionBody>(request);
    if (body.transition === undefined || body.expectedRecordVersion === undefined) {
      return failRequest(400, 'VALIDATION_ERROR', path);
    }
    const result = transitionRuleRecord(
      pathParam(params, 'ruleId'),
      body.transition,
      body.expectedRecordVersion,
    );
    if (result.conflict) {
      return failRequest(409, 'CONFLICT', path);
    }
    return result.record === null
      ? failRequest(404, 'NOT_FOUND', path)
      : HttpResponse.json(result.record);
  });
}

const rulesHandlers = [
  http.get(teamUrl('/points-rules'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(rulesResponse())
      : failRequest(401, 'UNAUTHORIZED', '/points-rules'),
  ),
  http.get(teamUrl('/calculation-rules'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(rulesResponse())
      : failRequest(401, 'UNAUTHORIZED', '/calculation-rules'),
  ),
  transitionHandler('/points-rules/:ruleId/transition'),
  transitionHandler('/calculation-rules/:ruleId/transition'),
  http.post(teamUrl('/calculation-rules/:ruleId/simulate'), async ({ request }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/calculation-rules');
    }
    const body = await readJsonBody<SimulateBody>(request);
    return body.membershipId === undefined
      ? failRequest(400, 'VALIDATION_ERROR', '/calculation-rules')
      : HttpResponse.json(simulationResponse(body.membershipId));
  }),
];

/**
 * Platform super-admin handlers. Only a principal holding `platform.admin`
 * passes; the LAST-admin revoke answers the backend's dedicated 409 key so
 * the client's privilege copy is exercised against the real refusal shape.
 */
const platformAdminsHandlers = [
  http.get(apiUrl('/rbac/platform/super-admins'), ({ request }) => {
    if (personaFromToken(request) === null) {
      return failRequest(401, 'UNAUTHORIZED', '/rbac/platform/super-admins');
    }
    if (!permissionsForRequest(request).includes(PERMISSIONS.platformAdmin)) {
      return failRequest(403, 'FORBIDDEN', '/rbac/platform/super-admins');
    }
    return HttpResponse.json(superAdminsResponse());
  }),
  http.post(apiUrl('/rbac/platform/super-admins'), async ({ request }) => {
    const actor = personaFromToken(request);
    if (actor === null) {
      return failRequest(401, 'UNAUTHORIZED', '/rbac/platform/super-admins');
    }
    if (!actor.permissions.includes(PERMISSIONS.platformAdmin)) {
      return failRequest(403, 'FORBIDDEN', '/rbac/platform/super-admins');
    }
    const body = await readJsonBody<{ userId?: string; reason?: string }>(request);
    if (body.userId === undefined || (body.reason ?? '').length < 8) {
      return failRequest(400, 'VALIDATION_ERROR', '/rbac/platform/super-admins');
    }
    const record = promoteSuperAdminRecord(body.userId, actor.id);
    return record === 'unknown-user'
      ? failRequest(409, 'CONFLICT', '/rbac/platform/super-admins')
      : HttpResponse.json(record, { status: 201 });
  }),
  http.delete(apiUrl('/rbac/platform/super-admins/:userId'), ({ request, params }) => {
    if (personaFromToken(request) === null) {
      return failRequest(401, 'UNAUTHORIZED', '/rbac/platform/super-admins');
    }
    if (!permissionsForRequest(request).includes(PERMISSIONS.platformAdmin)) {
      return failRequest(403, 'FORBIDDEN', '/rbac/platform/super-admins');
    }
    const outcome = revokeSuperAdminRecord(pathParam(params, 'userId'));
    if (outcome === 'not-found') {
      return failRequest(404, 'NOT_FOUND', '/rbac/platform/super-admins');
    }
    if (outcome === 'last-admin') {
      return nestErrorResponse({
        statusCode: 409,
        code: 'LAST_SUPER_ADMIN',
        message: 'errors.rbac.lastSuperAdmin',
        messageKey: 'errors.rbac.lastSuperAdmin',
        path: '/api/v1/rbac/platform/super-admins',
      });
    }
    return new HttpResponse(null, { status: 204 });
  }),
];

/**
 * Operations handlers. All four surfaces are published as of contract 1.2.0;
 * job health and the dead-letter listing mirror the heartbeat-backed backend.
 */
const operationsHandlers = [
  http.get(apiUrl('/admin/outbox/metrics'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(outboxMetricsResponse())
      : failRequest(401, 'UNAUTHORIZED', '/admin/outbox/metrics'),
  ),
  http.get(apiUrl('/admin/outbox/dead-letters'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(deadLettersResponse())
      : failRequest(401, 'UNAUTHORIZED', '/admin/outbox/dead-letters'),
  ),
  http.post(apiUrl('/admin/outbox/:eventId/replay'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/admin/outbox/replay');
    }
    if (!permissionsForRequest(request).includes(PERMISSIONS.outboxManage)) {
      return failRequest(403, 'FORBIDDEN', '/admin/outbox/replay');
    }
    const record = replayEventRecord(pathParam(params, 'eventId'));
    return record === null
      ? failRequest(404, 'NOT_FOUND', '/admin/outbox/replay')
      : HttpResponse.json(record);
  }),
  http.get(apiUrl('/admin/jobs/health'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(jobHealthResponse())
      : failRequest(401, 'UNAUTHORIZED', '/admin/jobs/health'),
  ),
  http.get(teamUrl('/audit'), ({ request }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/audit');
    }
    return permissionsForRequest(request).includes(PERMISSIONS.auditRead)
      ? HttpResponse.json(auditResponse())
      : failRequest(403, 'FORBIDDEN', '/audit');
  }),
];

export const adminHandlers = [
  ...adminSettingsHandlers,
  ...rulesHandlers,
  ...operationsHandlers,
  ...platformAdminsHandlers,
];
