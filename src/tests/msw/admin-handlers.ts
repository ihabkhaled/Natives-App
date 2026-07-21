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
import {
  catalogEntriesResponse,
  createSettingVersionRecord,
  seasonsResponse,
  settingsSnapshotResponse,
  settingVersionsResponse,
  venuesResponse,
} from './admin.fixture';
import { apiUrl, failRequest, isAuthorized, pathParam, readJsonBody } from './mock-request.helper';
import { permissionsForRequest } from './persona-permissions.helper';

interface VersionBody {
  readonly settingKey?: string;
  readonly effectiveFrom?: string;
  readonly value?: unknown;
  readonly note?: string;
}

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

type CatalogKind = 'division' | 'gender_format' | 'position';

const SETTING_KEY_VALUES = [
  'attendance_statuses',
  'session_types',
  'attendance_weights',
  'assessment_scale',
  'badge_tiers',
  'roster_limits',
  'notification_rules',
  'report_branding',
] as const;

type SettingKeyValue = (typeof SETTING_KEY_VALUES)[number];

function readSettingKey(value: string): SettingKeyValue {
  const match = SETTING_KEY_VALUES.find((candidate) => candidate === value);
  return match ?? 'attendance_statuses';
}

function readCatalogKind(value: string): CatalogKind {
  return value === 'gender_format' || value === 'position' ? value : 'division';
}

function searchParam(request: Request, name: string, fallback: string): string {
  return new URL(request.url).searchParams.get(name) ?? fallback;
}

const settingsHandlers = [
  http.get(teamUrl('/settings/snapshot'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(settingsSnapshotResponse())
      : failRequest(401, 'UNAUTHORIZED', '/settings/snapshot'),
  ),
  http.get(teamUrl('/settings/versions'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(settingVersionsResponse(searchParam(request, 'settingKey', '')))
      : failRequest(401, 'UNAUTHORIZED', '/settings/versions'),
  ),
  http.post(teamUrl('/settings/versions'), async ({ request }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/settings/versions');
    }
    if (!permissionsForRequest(request).includes(PERMISSIONS.settingsManage)) {
      return failRequest(403, 'FORBIDDEN', '/settings/versions');
    }
    const body = await readJsonBody<VersionBody>(request);
    if (body.settingKey === undefined || body.effectiveFrom === undefined) {
      return failRequest(400, 'VALIDATION_ERROR', '/settings/versions');
    }
    return HttpResponse.json(
      createSettingVersionRecord(
        readSettingKey(body.settingKey),
        body.effectiveFrom,
        body.value ?? null,
        body.note ?? null,
      ),
      { status: 201 },
    );
  }),
  http.get(teamUrl('/seasons'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(seasonsResponse())
      : failRequest(401, 'UNAUTHORIZED', '/seasons'),
  ),
  http.get(teamUrl('/venues'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(venuesResponse())
      : failRequest(401, 'UNAUTHORIZED', '/venues'),
  ),
  http.get(teamUrl('/catalog-entries'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(
          catalogEntriesResponse(readCatalogKind(searchParam(request, 'catalog', 'division'))),
        )
      : failRequest(401, 'UNAUTHORIZED', '/catalog-entries'),
  ),
];

function transitionHandler(path: string) {
  return http.post(teamUrl(path), async ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', path);
    }
    if (!permissionsForRequest(request).includes(PERMISSIONS.pointsRuleManage)) {
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
 * Operations handlers. `/admin/outbox/metrics` and `.../replay` are published;
 * the dead-letter listing and job health are backend-pending and recorded as
 * such in docs/api-verification.md.
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

export const adminHandlers = [...settingsHandlers, ...rulesHandlers, ...operationsHandlers];
