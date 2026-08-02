import { http, HttpResponse } from 'msw';

import { PERMISSIONS } from '@/shared/security';

import { apiUrl, failRequest, isAuthorized, pathParam, readJsonBody } from './mock-request.helper';
import { has, queryValue } from './persona-permissions.helper';
import {
  generateReportJob,
  reportDownloadTicket,
  reportJobRecord,
  reportJobsResponse,
  retryReportJob,
} from './reports.fixture';

function teamUrl(suffix: string): string {
  return apiUrl(`/teams/:teamId/reports${suffix}`);
}

/**
 * NestJS-shaped reports handlers. Listing and reading a job is report.read;
 * requesting, retrying, and downloading are report.generate. The list is
 * stateful so the queued job advances over successive polls, and the download
 * mints a fresh signed URL each call (never streams the artifact).
 */
export const reportsHandlers = [
  http.get(teamUrl('/:jobId/download'), ({ request, params }) => {
    if (!has(request, PERMISSIONS.reportsGenerate)) {
      return failRequest(403, 'FORBIDDEN', '/reports/download');
    }
    const record = reportJobRecord(pathParam(params, 'jobId'));
    if (record === null) {
      return failRequest(404, 'NOT_FOUND', '/reports', 'errors.reports.jobNotFound');
    }
    if (record.status === 'expired') {
      return failRequest(410, 'GONE', '/reports/download', 'errors.reports.expired');
    }
    if (record.status !== 'completed') {
      return failRequest(409, 'CONFLICT', '/reports/download', 'errors.reports.notReady');
    }
    return HttpResponse.json(reportDownloadTicket());
  }),
  http.post(teamUrl('/:jobId/retry'), ({ request, params }) => {
    if (!has(request, PERMISSIONS.reportsGenerate)) {
      return failRequest(403, 'FORBIDDEN', '/reports/retry');
    }
    const record = retryReportJob(pathParam(params, 'jobId'));
    return record === null
      ? failRequest(409, 'CONFLICT', '/reports/retry', 'errors.reports.retryNotAllowed')
      : HttpResponse.json(record);
  }),
  http.get(teamUrl('/:jobId'), ({ request, params }) => {
    if (!has(request, PERMISSIONS.reportsRead)) {
      return failRequest(403, 'FORBIDDEN', '/reports');
    }
    const record = reportJobRecord(pathParam(params, 'jobId'));
    return record === null
      ? failRequest(404, 'NOT_FOUND', '/reports', 'errors.reports.jobNotFound')
      : HttpResponse.json(record);
  }),
  http.get(teamUrl(''), ({ request }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/reports');
    }
    if (!has(request, PERMISSIONS.reportsRead)) {
      return failRequest(403, 'FORBIDDEN', '/reports');
    }
    return HttpResponse.json(
      reportJobsResponse(queryValue(request, 'template'), queryValue(request, 'status')),
    );
  }),
  http.post(teamUrl(''), async ({ request }) => {
    if (!has(request, PERMISSIONS.reportsGenerate)) {
      return failRequest(403, 'FORBIDDEN', '/reports');
    }
    const body = await readJsonBody<{
      template?: string;
      format?: string;
      seasonId?: string | null;
    }>(request);
    return HttpResponse.json(generateReportJob(body), { status: 201 });
  }),
];
