import { http, HttpResponse } from 'msw';

import { PERMISSIONS } from '@/shared/security';

import {
  archiveDrillRecord,
  createDrillRecord,
  drillResponse,
  drillsResponse,
  updateDrillRecord,
  type DrillWriteBody,
} from './drills.fixture';
import { apiUrl, failRequest, pathParam, readJsonBody } from './mock-request.helper';
import { has } from './persona-permissions.helper';

function drillsUrl(suffix: string): string {
  return apiUrl(`/teams/:teamId/drills${suffix}`);
}

/**
 * NestJS-shaped drill-catalogue handlers. Every route gates on
 * `drill.manage`: the backend publishes no separate read grant, so a member
 * without the coach grant gets 403 even for the list.
 */
const readHandlers = [
  http.get(drillsUrl(''), ({ request }) => {
    if (!has(request, PERMISSIONS.drillManage)) {
      return failRequest(403, 'FORBIDDEN', '/drills');
    }
    return HttpResponse.json(drillsResponse());
  }),
  http.get(drillsUrl('/:drillId'), ({ request, params }) => {
    if (!has(request, PERMISSIONS.drillManage)) {
      return failRequest(403, 'FORBIDDEN', '/drills');
    }
    const record = drillResponse(pathParam(params, 'drillId'));
    return record === null ? failRequest(404, 'NOT_FOUND', '/drills') : HttpResponse.json(record);
  }),
];

const writeHandlers = [
  http.post(drillsUrl(''), async ({ request }) => {
    if (!has(request, PERMISSIONS.drillManage)) {
      return failRequest(403, 'FORBIDDEN', '/drills');
    }
    const body = await readJsonBody<DrillWriteBody>(request);
    return HttpResponse.json(createDrillRecord(body), { status: 201 });
  }),
  http.patch(drillsUrl('/:drillId'), async ({ request, params }) => {
    if (!has(request, PERMISSIONS.drillManage)) {
      return failRequest(403, 'FORBIDDEN', '/drills');
    }
    const body = await readJsonBody<DrillWriteBody>(request);
    const result = updateDrillRecord(pathParam(params, 'drillId'), body);
    if (result === 'not-found') {
      return failRequest(404, 'NOT_FOUND', '/drills');
    }
    return result === 'conflict'
      ? failRequest(409, 'VERSION_CONFLICT', '/drills')
      : HttpResponse.json(result);
  }),
  http.post(drillsUrl('/:drillId/archive'), ({ request, params }) => {
    if (!has(request, PERMISSIONS.drillManage)) {
      return failRequest(403, 'FORBIDDEN', '/drills');
    }
    const result = archiveDrillRecord(pathParam(params, 'drillId'));
    return result === 'not-found'
      ? failRequest(404, 'NOT_FOUND', '/drills')
      : HttpResponse.json(result);
  }),
];

export const drillsHandlers = [...readHandlers, ...writeHandlers];
