import { http, HttpResponse } from 'msw';

import { PERMISSIONS } from '@/shared/security';

import {
  achievementRecord,
  achievementsResponse,
  createAchievementRecord,
  importReport,
  teamHistoryResponse,
  transitionAchievementRecord,
} from './achievements.fixture';
import { apiUrl, failRequest, isAuthorized, pathParam, readJsonBody } from './mock-request.helper';
import { has, queryValue } from './persona-permissions.helper';
import {
  publishStandingsRule,
  recomputeReport,
  recordManualStanding,
  standingsResponse,
  standingsRulesResponse,
} from './standings.fixture';

function teamUrl(suffix: string): string {
  return apiUrl(`/teams/:teamId${suffix}`);
}

/**
 * NestJS-shaped standings handlers: table reads under competition.read; the
 * writes under competition.manage; import additionally under import.manage;
 * the cabinet under team.read. Achievement transitions honour optimistic
 * concurrency and answer 409 with the versionConflict message key.
 */
export const standingsHandlers = [
  http.get(teamUrl('/standings'), ({ request }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/standings');
    }
    if (!has(request, PERMISSIONS.competitionRead)) {
      return failRequest(403, 'FORBIDDEN', '/standings');
    }
    return HttpResponse.json(standingsResponse(queryValue(request, 'source')));
  }),
  http.post(teamUrl('/standings/recompute'), ({ request }) => {
    if (!has(request, PERMISSIONS.competitionManage)) {
      return failRequest(403, 'FORBIDDEN', '/standings/recompute');
    }
    return HttpResponse.json(recomputeReport());
  }),
  http.post(teamUrl('/standings/manual'), async ({ request }) => {
    if (!has(request, PERMISSIONS.competitionManage)) {
      return failRequest(403, 'FORBIDDEN', '/standings/manual');
    }
    const body = await readJsonBody<{
      reconciliationNote?: string;
      opponentId?: string | null;
      entrantKind?: string;
    }>(request);
    if ((body.reconciliationNote ?? '').trim().length < 3) {
      return failRequest(
        422,
        'VALIDATION_ERROR',
        '/standings/manual',
        'errors.standings.provenanceRequired',
      );
    }
    return HttpResponse.json(recordManualStanding(body), { status: 201 });
  }),
  http.get(teamUrl('/standings-rules'), ({ request }) => {
    if (!has(request, PERMISSIONS.competitionRead)) {
      return failRequest(403, 'FORBIDDEN', '/standings-rules');
    }
    return HttpResponse.json(standingsRulesResponse());
  }),
  http.post(teamUrl('/standings-rules'), async ({ request }) => {
    if (!has(request, PERMISSIONS.competitionManage)) {
      return failRequest(403, 'FORBIDDEN', '/standings-rules');
    }
    const body = await readJsonBody<{ ruleKey?: string; name?: string }>(request);
    return HttpResponse.json(publishStandingsRule(body), { status: 201 });
  }),
  http.get(teamUrl('/achievements'), ({ request }) => {
    if (!has(request, PERMISSIONS.competitionRead)) {
      return failRequest(403, 'FORBIDDEN', '/achievements');
    }
    return HttpResponse.json(achievementsResponse(queryValue(request, 'status')));
  }),
  http.post(teamUrl('/achievements/import'), async ({ request }) => {
    if (!has(request, PERMISSIONS.competitionManage) || !has(request, PERMISSIONS.importManage)) {
      return failRequest(403, 'FORBIDDEN', '/achievements/import');
    }
    const body = await readJsonBody<{ dryRun?: boolean }>(request);
    return HttpResponse.json(importReport(body.dryRun ?? true));
  }),
  http.get(teamUrl('/achievements/:achievementId'), ({ request, params }) => {
    if (!has(request, PERMISSIONS.competitionRead)) {
      return failRequest(403, 'FORBIDDEN', '/achievements');
    }
    const record = achievementRecord(pathParam(params, 'achievementId'));
    return record === null
      ? failRequest(404, 'NOT_FOUND', '/achievements', 'errors.standings.achievementNotFound')
      : HttpResponse.json(record);
  }),
  http.post(teamUrl('/achievements/:achievementId/transition'), async ({ request, params }) => {
    if (!has(request, PERMISSIONS.competitionManage)) {
      return failRequest(403, 'FORBIDDEN', '/achievements/transition');
    }
    const body = await readJsonBody<{
      transition?: string;
      expectedRecordVersion?: number;
      reason?: string | null;
    }>(request);
    const outcome = transitionAchievementRecord(pathParam(params, 'achievementId'), body);
    if (outcome === null) {
      return failRequest(404, 'NOT_FOUND', '/achievements', 'errors.standings.achievementNotFound');
    }
    if ('conflict' in outcome) {
      return failRequest(
        409,
        'CONFLICT',
        '/achievements/transition',
        'errors.standings.versionConflict',
      );
    }
    return HttpResponse.json(outcome.record);
  }),
  http.post(teamUrl('/achievements'), async ({ request }) => {
    if (!has(request, PERMISSIONS.competitionManage)) {
      return failRequest(403, 'FORBIDDEN', '/achievements');
    }
    const body = await readJsonBody<{ title?: string; category?: string; visibility?: string }>(
      request,
    );
    return HttpResponse.json(createAchievementRecord(body), { status: 201 });
  }),
  http.get(teamUrl('/history'), ({ request }) => {
    if (!has(request, PERMISSIONS.teamRead)) {
      return failRequest(403, 'FORBIDDEN', '/history');
    }
    return HttpResponse.json(teamHistoryResponse(queryValue(request, 'category')));
  }),
];
