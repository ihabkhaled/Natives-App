import { http, HttpResponse } from 'msw';

import {
  MOCK_CATEGORIES,
  MOCK_METRICS,
  MOCK_PERIODS,
  MOCK_SCALES,
  MOCK_TEMPLATES,
} from './assessments-catalog.fixture';
import type { AssessmentValueRecord } from './assessments-data.fixture';
import {
  acknowledgeFeedbackRecord,
  assessmentDetailResponse,
  listAssessmentsResponse,
  myAssessmentsResponse,
  myFeedbackResponse,
  myGoalsResponse,
  revisionsResponse,
  saveValues,
  transitionAssessmentRecord,
  transitionGoalRecord,
} from './assessments.fixture';
import { apiUrl, isAuthorized } from './mock-request.helper';
import { nestErrorResponse } from './nest-error.helper';

interface SaveBody {
  readonly expectedRecordVersion?: number;
  readonly summary?: string | null;
  readonly values?: readonly AssessmentValueRecord[];
}

interface VersionBody {
  readonly expectedRecordVersion?: number;
  readonly decision?: string;
  readonly transition?: string;
  readonly clarificationRequested?: boolean;
}

function fail(status: number, code: string, path: string): Response {
  return nestErrorResponse({ statusCode: status, code, message: code, path: `/api/v1${path}` });
}

function assessmentsUrl(suffix: string): string {
  return apiUrl(`/teams/:teamId/player-assessments${suffix}`);
}

function catalogUrl(resource: string): string {
  return apiUrl(`/teams/:teamId/assessment-catalog/${resource}`);
}

function param(params: Record<string, unknown>, key: string): string {
  return String(params[key]);
}

function readPaging(request: Request): { limit: number; offset: number } {
  const url = new URL(request.url);
  return {
    limit: Number.parseInt(url.searchParams.get('limit') ?? '20', 10),
    offset: Number.parseInt(url.searchParams.get('offset') ?? '0', 10),
  };
}

async function readJson<T>(request: Request): Promise<T> {
  return (await request.json().catch(() => ({}))) as T;
}

function pagedCatalog(items: readonly unknown[]): Record<string, unknown> {
  return { items, total: items.length, limit: 100, offset: 0 };
}

const catalogHandlers = [
  ['templates', MOCK_TEMPLATES],
  ['metrics', MOCK_METRICS],
  ['scales', MOCK_SCALES],
  ['categories', MOCK_CATEGORIES],
  ['periods', MOCK_PERIODS],
].map(([resource, items]) =>
  http.get(catalogUrl(resource as string), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(pagedCatalog(items as readonly unknown[]))
      : fail(401, 'UNAUTHORIZED', `/assessment-catalog/${resource as string}`),
  ),
);

const assessmentHandlers = [
  http.get(assessmentsUrl(''), ({ request }) => {
    if (!isAuthorized(request)) {
      return fail(401, 'UNAUTHORIZED', '/player-assessments');
    }
    const paging = readPaging(request);
    return HttpResponse.json(listAssessmentsResponse(paging.limit, paging.offset));
  }),
  http.get(assessmentsUrl('/:assessmentId'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return fail(401, 'UNAUTHORIZED', '/player-assessments');
    }
    const detail = assessmentDetailResponse(param(params, 'assessmentId'));
    return detail === null
      ? fail(404, 'NOT_FOUND', '/player-assessments')
      : HttpResponse.json(detail);
  }),
  http.get(assessmentsUrl('/:assessmentId/revisions'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return fail(401, 'UNAUTHORIZED', '/player-assessments');
    }
    const revisions = revisionsResponse(param(params, 'assessmentId'));
    return revisions === null
      ? fail(404, 'NOT_FOUND', '/player-assessments')
      : HttpResponse.json(revisions);
  }),
  http.put(assessmentsUrl('/:assessmentId/values'), async ({ request, params }) => {
    if (!isAuthorized(request)) {
      return fail(401, 'UNAUTHORIZED', '/player-assessments');
    }
    const body = await readJson<SaveBody>(request);
    const result = saveValues(
      param(params, 'assessmentId'),
      body.expectedRecordVersion ?? 0,
      body.summary ?? null,
      body.values ?? [],
    );
    if (result === 'not-found') {
      return fail(404, 'NOT_FOUND', '/player-assessments');
    }
    return result === 'conflict'
      ? fail(409, 'VERSION_CONFLICT', '/player-assessments')
      : HttpResponse.json(result);
  }),
];

function workflowHandler(step: string) {
  return http.post(assessmentsUrl(`/:assessmentId/${step}`), async ({ request, params }) => {
    if (!isAuthorized(request)) {
      return fail(401, 'UNAUTHORIZED', `/player-assessments/${step}`);
    }
    const body = await readJson<VersionBody>(request);
    const result = transitionAssessmentRecord(
      param(params, 'assessmentId'),
      step === 'review' ? (body.decision ?? 'start_review') : step,
      body.expectedRecordVersion ?? 0,
    );
    if (result === 'not-found') {
      return fail(404, 'NOT_FOUND', `/player-assessments/${step}`);
    }
    return result === 'conflict'
      ? fail(409, 'VERSION_CONFLICT', `/player-assessments/${step}`)
      : HttpResponse.json(result);
  });
}

const selfHandlers = [
  http.get(apiUrl('/teams/:teamId/my-assessments'), ({ request }) => {
    if (!isAuthorized(request)) {
      return fail(401, 'UNAUTHORIZED', '/my-assessments');
    }
    const paging = readPaging(request);
    return HttpResponse.json(myAssessmentsResponse(paging.limit, paging.offset));
  }),
  http.get(apiUrl('/teams/:teamId/my-feedback'), ({ request }) => {
    if (!isAuthorized(request)) {
      return fail(401, 'UNAUTHORIZED', '/my-feedback');
    }
    const paging = readPaging(request);
    return HttpResponse.json(myFeedbackResponse(paging.limit, paging.offset));
  }),
  http.post(
    apiUrl('/teams/:teamId/my-feedback/:feedbackId/acknowledge'),
    async ({ request, params }) => {
      if (!isAuthorized(request)) {
        return fail(401, 'UNAUTHORIZED', '/my-feedback');
      }
      const body = await readJson<VersionBody>(request);
      const result = acknowledgeFeedbackRecord(
        param(params, 'feedbackId'),
        body.clarificationRequested === true,
      );
      return result === null ? fail(404, 'NOT_FOUND', '/my-feedback') : HttpResponse.json(result);
    },
  ),
  http.get(apiUrl('/teams/:teamId/my-development-goals'), ({ request }) => {
    if (!isAuthorized(request)) {
      return fail(401, 'UNAUTHORIZED', '/my-development-goals');
    }
    const paging = readPaging(request);
    return HttpResponse.json(myGoalsResponse(paging.limit, paging.offset));
  }),
  http.post(
    apiUrl('/teams/:teamId/development-goals/:goalId/transition'),
    async ({ request, params }) => {
      if (!isAuthorized(request)) {
        return fail(401, 'UNAUTHORIZED', '/development-goals');
      }
      const body = await readJson<VersionBody>(request);
      const result = transitionGoalRecord(
        param(params, 'goalId'),
        body.transition ?? 'activate',
        body.expectedRecordVersion ?? 0,
      );
      if (result === 'not-found') {
        return fail(404, 'NOT_FOUND', '/development-goals');
      }
      return result === 'conflict'
        ? fail(409, 'VERSION_CONFLICT', '/development-goals')
        : HttpResponse.json(result);
    },
  ),
];

/** NestJS-shaped assessment, feedback, and development-goal handlers. */
export const assessmentsHandlers = [
  ...catalogHandlers,
  ...assessmentHandlers,
  workflowHandler('submit'),
  workflowHandler('review'),
  workflowHandler('publish'),
  ...selfHandlers,
];
