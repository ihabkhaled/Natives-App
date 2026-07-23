import { http, HttpResponse } from 'msw';

import type * as AdminModuleNamespace from '@/modules/admin';
import { PERMISSIONS } from '@/shared/security';

import {
  cancelVersionRecord,
  catalogEntriesResponse,
  createSettingVersionRecord,
  hasVersionAtInstant,
  headVersionIdFor,
  seasonsResponse,
  settingsSnapshotResponse,
  settingVersionsResponse,
  venuesResponse,
} from './admin.fixture';
import { apiUrl, failRequest, isAuthorized, pathParam, readJsonBody } from './mock-request.helper';
import { nestErrorResponse } from './nest-error.helper';
import { permissionsForRequest } from './persona-permissions.helper';

interface VersionBody {
  readonly settingKey?: string;
  readonly effectiveFrom?: string;
  readonly value?: unknown;
  readonly note?: string;
  readonly expectedHeadVersionId?: string | null;
}

type AdminModule = typeof AdminModuleNamespace;

let adminModulePromise: Promise<AdminModule> | null = null;

/**
 * The admin module is loaded LAZILY, at first request, through its public
 * index. An eager import here would execute during MSW setup and freeze the
 * module's containers in the cache BEFORE a test file's vi.mock of
 * '@/shared/ui' can take effect; by request time every mock is registered.
 */
function loadAdminModule(): Promise<AdminModule> {
  adminModulePromise ??= import('@/modules/admin');
  return adminModulePromise;
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

function refuseUnauthorizedWrite(request: Request): Response | null {
  if (!isAuthorized(request)) {
    return failRequest(401, 'UNAUTHORIZED', '/settings/versions');
  }
  if (!permissionsForRequest(request).includes(PERMISSIONS.settingsManage)) {
    return failRequest(403, 'FORBIDDEN', '/settings/versions');
  }
  return null;
}

/**
 * Mirror of the backend's per-key write policy (P2): strict-UTC instants,
 * mandatory reasons, schema-invalid documents refused with the backend's
 * message key, the optimistic head guard's stale 409, and the future-only
 * cancel. The client is expected to block most of these before the wire —
 * the mirror keeps that honest.
 */
async function refuseInvalidVersionBody(body: VersionBody): Promise<Response | null> {
  const admin = await loadAdminModule();
  if (body.settingKey === undefined || body.effectiveFrom === undefined) {
    return failRequest(400, 'VALIDATION_ERROR', '/settings/versions');
  }
  if (!admin.UTC_INSTANT_PATTERN.test(body.effectiveFrom)) {
    return failRequest(400, 'VALIDATION_ERROR', '/settings/versions');
  }
  if (body.effectiveFrom < new Date(Date.now() - 300_000).toISOString()) {
    return nestErrorResponse({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'errors.teams.settingEffectiveInPast',
      messageKey: 'errors.teams.settingEffectiveInPast',
      path: '/settings/versions',
    });
  }
  if ((body.note ?? '').trim().length < admin.ADMIN_LIMITS.minimumReasonLength) {
    return failRequest(400, 'VALIDATION_ERROR', '/settings/versions');
  }
  const parsed = admin.parseTypedSettingValue(readSettingKey(body.settingKey), body.value);
  if (!parsed.success) {
    return nestErrorResponse({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'errors.teams.settingValueInvalid',
      messageKey: 'errors.teams.settingValueInvalid',
      path: '/settings/versions',
      errors: parsed.issues.map((issue) => ({
        field: issue.path,
        code: issue.message,
        message: issue.message,
      })),
    });
  }
  return null;
}

function refuseVersionConflicts(body: VersionBody): Response | null {
  const settingKey = readSettingKey(body.settingKey ?? '');
  if (
    body.expectedHeadVersionId !== undefined &&
    body.expectedHeadVersionId !== headVersionIdFor(settingKey)
  ) {
    return nestErrorResponse({
      statusCode: 409,
      code: 'CONFLICT',
      message: 'errors.teams.settingVersionStale',
      messageKey: 'errors.teams.settingVersionStale',
      path: '/settings/versions',
    });
  }
  if (hasVersionAtInstant(settingKey, body.effectiveFrom ?? '')) {
    return failRequest(409, 'CONFLICT', '/settings/versions');
  }
  return null;
}

export const adminSettingsHandlers = [
  http.get(teamUrl('/settings/snapshot'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(
          settingsSnapshotResponse(new URL(request.url).searchParams.get('asOf') ?? undefined),
        )
      : failRequest(401, 'UNAUTHORIZED', '/settings/snapshot'),
  ),
  http.get(teamUrl('/settings/versions'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(settingVersionsResponse(searchParam(request, 'settingKey', '')))
      : failRequest(401, 'UNAUTHORIZED', '/settings/versions'),
  ),
  http.post(teamUrl('/settings/versions'), async ({ request }) => {
    const guarded = refuseUnauthorizedWrite(request);
    if (guarded !== null) {
      return guarded;
    }
    const body = await readJsonBody<VersionBody>(request);
    const refusal = (await refuseInvalidVersionBody(body)) ?? refuseVersionConflicts(body);
    if (refusal !== null) {
      return refusal;
    }
    return HttpResponse.json(
      createSettingVersionRecord(
        readSettingKey(body.settingKey ?? ''),
        body.effectiveFrom ?? '',
        body.value ?? null,
        body.note ?? null,
      ),
      { status: 201 },
    );
  }),
  http.delete(teamUrl('/settings/versions/:versionId'), ({ request, params }) => {
    const guarded = refuseUnauthorizedWrite(request);
    if (guarded !== null) {
      return guarded;
    }
    const outcome = cancelVersionRecord(pathParam(params, 'versionId'));
    if (outcome === 'not-found') {
      return failRequest(404, 'NOT_FOUND', '/settings/versions');
    }
    if (outcome === 'in-effect') {
      return nestErrorResponse({
        statusCode: 409,
        code: 'CONFLICT',
        message: 'errors.teams.settingVersionNotCancellable',
        messageKey: 'errors.teams.settingVersionNotCancellable',
        path: '/settings/versions',
      });
    }
    return new HttpResponse(null, { status: 204 });
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
