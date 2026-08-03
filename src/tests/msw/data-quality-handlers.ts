import { http, HttpResponse } from 'msw';

import { PERMISSIONS } from '@/shared/security';

import { apiUrl, failRequest, pathParam } from './mock-request.helper';
import { MOCK_ANOMALIES } from './data-quality.fixture';
import { has } from './persona-permissions.helper';

const BASE = '/teams/:teamId/data-quality';

/**
 * NestJS-shaped data-quality handlers. Every route is data_quality.manage —
 * there is no read-only grant — and the repair preview is a GET because it
 * changes nothing.
 */
export const dataQualityHandlers = [
  http.get(apiUrl(`${BASE}/anomalies`), ({ request }) => {
    if (!has(request, PERMISSIONS.dataQualityManage)) {
      return failRequest(403, 'FORBIDDEN', '/data-quality/anomalies');
    }
    return HttpResponse.json({
      items: MOCK_ANOMALIES,
      total: MOCK_ANOMALIES.length,
      limit: 25,
      offset: 0,
    });
  }),
  http.get(apiUrl(`${BASE}/anomalies/:anomalyId/repair-preview`), ({ request, params }) => {
    if (!has(request, PERMISSIONS.dataQualityManage)) {
      return failRequest(403, 'FORBIDDEN', '/data-quality/repair-preview');
    }
    return HttpResponse.json({
      anomalyId: pathParam(params, 'anomalyId'),
      repairKind: 'merge_duplicate_jersey',
      impactCount: 4,
      impactSummary: 'Four roster entries would be renumbered.',
      reversible: true,
    });
  }),
  http.post(apiUrl(`${BASE}/anomalies/:anomalyId/repair-apply`), ({ request, params }) =>
    has(request, PERMISSIONS.dataQualityManage)
      ? HttpResponse.json(buildRepair(pathParam(params, 'anomalyId'), 'applied'))
      : failRequest(403, 'FORBIDDEN', '/data-quality/repair-apply'),
  ),
  http.post(apiUrl(`${BASE}/anomalies/:anomalyId/repair-rollback`), ({ request, params }) =>
    has(request, PERMISSIONS.dataQualityManage)
      ? HttpResponse.json(buildRepair(pathParam(params, 'anomalyId'), 'rolled_back'))
      : failRequest(403, 'FORBIDDEN', '/data-quality/repair-rollback'),
  ),
  http.post(apiUrl(`${BASE}/anomalies/:anomalyId/transition`), ({ request, params }) => {
    if (!has(request, PERMISSIONS.dataQualityManage)) {
      return failRequest(403, 'FORBIDDEN', '/data-quality/transition');
    }
    const anomalyId = pathParam(params, 'anomalyId');
    const found = MOCK_ANOMALIES.find((entry) => entry.anomalyId === anomalyId);
    return found === undefined
      ? failRequest(404, 'NOT_FOUND', '/data-quality/transition')
      : HttpResponse.json({
          ...found,
          status: 'acknowledged',
          recordVersion: found.recordVersion + 1,
        });
  }),
  http.post(apiUrl(`${BASE}/scan`), ({ request }) =>
    has(request, PERMISSIONS.dataQualityManage)
      ? HttpResponse.json({
          ruleVersion: '3',
          rulesRun: 12,
          detected: 3,
          opened: 1,
          reopened: 0,
          alertable: 1,
        })
      : failRequest(403, 'FORBIDDEN', '/data-quality/scan'),
  ),
];

function buildRepair(anomalyId: string, status: string): Record<string, unknown> {
  return {
    repairId: `repair-${anomalyId}`,
    anomalyId,
    repairKind: 'merge_duplicate_jersey',
    status,
    impactCount: 4,
    impactSummary: 'Four roster entries were renumbered.',
    rollbackRef: status === 'applied' ? 'rollback-1' : null,
    recordVersion: 1,
    appliedAt: '2026-08-02T09:00:00.000Z',
    rolledBackAt: status === 'rolled_back' ? '2026-08-02T10:00:00.000Z' : null,
    createdAt: '2026-08-02T09:00:00.000Z',
    updatedAt: '2026-08-02T10:00:00.000Z',
  };
}
