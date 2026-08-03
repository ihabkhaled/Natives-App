import { http, HttpResponse } from 'msw';

import { PERMISSIONS } from '@/shared/security';

import { apiUrl, failRequest, readJsonBody } from './mock-request.helper';
import { has } from './persona-permissions.helper';
import { MOCK_PRACTICE_AGENDA } from './practice-agenda.fixture';

const BASE = '/teams/:teamId/practice-sessions/:sessionId/agenda';

interface ReorderBody {
  readonly blockIds?: readonly string[];
  readonly expectedVersion?: number;
}

/** The agenda header a write answers with; the blocks come from a re-read. */
function summaryAt(version: number): Record<string, unknown> {
  return {
    sessionId: MOCK_PRACTICE_AGENDA.sessionId,
    agendaId: MOCK_PRACTICE_AGENDA.agendaId,
    status: MOCK_PRACTICE_AGENDA.status,
    theme: MOCK_PRACTICE_AGENDA.theme,
    notes: MOCK_PRACTICE_AGENDA.notes,
    publishedAt: MOCK_PRACTICE_AGENDA.publishedAt,
    completedAt: MOCK_PRACTICE_AGENDA.completedAt,
    version,
  };
}

/**
 * NestJS-shaped practice-agenda handlers.
 *
 * Reading the plan is `practice.read`; changing it is `practice.manage`, so a
 * member who may see the agenda of a session they attend still gets a 403 on
 * every write. The reorder enforces `expectedVersion` the way the real API
 * does — a stale move is a 409, not a silent overwrite — which is the only way
 * a client's reconciliation path gets exercised in mock mode.
 */
export const practiceAgendaHandlers = [
  http.get(apiUrl(BASE), ({ request }) =>
    has(request, PERMISSIONS.practicesRead)
      ? HttpResponse.json(MOCK_PRACTICE_AGENDA)
      : failRequest(403, 'FORBIDDEN', '/practice-sessions/agenda'),
  ),
  http.post(apiUrl(`${BASE}/blocks/reorder`), async ({ request }) => {
    if (!has(request, PERMISSIONS.practicesManage)) {
      return failRequest(403, 'FORBIDDEN', '/practice-sessions/agenda/blocks/reorder');
    }
    const body = await readJsonBody<ReorderBody>(request);
    const current = MOCK_PRACTICE_AGENDA.version ?? 1;
    if (body.expectedVersion !== undefined && body.expectedVersion !== current) {
      return failRequest(409, 'CONFLICT', '/practice-sessions/agenda/blocks/reorder');
    }
    return (body.blockIds ?? []).length === 0
      ? failRequest(400, 'VALIDATION_ERROR', '/practice-sessions/agenda/blocks/reorder')
      : HttpResponse.json(summaryAt(current + 1));
  }),
  http.delete(apiUrl(`${BASE}/blocks/:blockId/stations/:stationId`), ({ request }) =>
    has(request, PERMISSIONS.practicesManage)
      ? new HttpResponse(null, { status: 204 })
      : failRequest(403, 'FORBIDDEN', '/practice-sessions/agenda/blocks/stations'),
  ),
];
