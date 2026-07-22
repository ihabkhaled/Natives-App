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
import { PERMISSIONS } from '@/shared/security';

import {
  apiUrl,
  failRequest,
  isAuthorized,
  pathParam,
  readJsonBody,
  readPaging,
} from './mock-request.helper';
import { permissionsForRequest } from './persona-permissions.helper';

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

function assessmentsUrl(suffix: string): string {
  return apiUrl(`/teams/:teamId/player-assessments${suffix}`);
}

function catalogUrl(resource: string): string {
  return apiUrl(`/teams/:teamId/assessment-catalog/${resource}`);
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
  http.get(catalogUrl(resource as string), ({ request }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', `/assessment-catalog/${resource as string}`);
    }
    // The real catalog controllers guard every read with the staff-only
    // `assessment.read.team` grant; a member receives 403, never data.
    if (!permissionsForRequest(request).includes(PERMISSIONS.assessmentReadTeam)) {
      return failRequest(403, 'FORBIDDEN', `/assessment-catalog/${resource as string}`);
    }
    return HttpResponse.json(pagedCatalog(items as readonly unknown[]));
  }),
);

const assessmentHandlers = [
  http.get(assessmentsUrl(''), ({ request }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/player-assessments');
    }
    const paging = readPaging(request);
    return HttpResponse.json(listAssessmentsResponse(paging.limit, paging.offset));
  }),
  http.get(assessmentsUrl('/:assessmentId'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/player-assessments');
    }
    const detail = assessmentDetailResponse(pathParam(params, 'assessmentId'));
    return detail === null
      ? failRequest(404, 'NOT_FOUND', '/player-assessments')
      : HttpResponse.json(detail);
  }),
  http.get(assessmentsUrl('/:assessmentId/revisions'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/player-assessments');
    }
    const revisions = revisionsResponse(pathParam(params, 'assessmentId'));
    return revisions === null
      ? failRequest(404, 'NOT_FOUND', '/player-assessments')
      : HttpResponse.json(revisions);
  }),
  http.put(assessmentsUrl('/:assessmentId/values'), async ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/player-assessments');
    }
    const body = await readJsonBody<SaveBody>(request);
    const result = saveValues(
      pathParam(params, 'assessmentId'),
      body.expectedRecordVersion ?? 0,
      body.summary ?? null,
      body.values ?? [],
    );
    if (result === 'not-found') {
      return failRequest(404, 'NOT_FOUND', '/player-assessments');
    }
    return result === 'conflict'
      ? failRequest(409, 'VERSION_CONFLICT', '/player-assessments')
      : HttpResponse.json(result);
  }),
];

function workflowHandler(step: string) {
  return http.post(assessmentsUrl(`/:assessmentId/${step}`), async ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', `/player-assessments/${step}`);
    }
    const body = await readJsonBody<VersionBody>(request);
    const result = transitionAssessmentRecord(
      pathParam(params, 'assessmentId'),
      step === 'review' ? (body.decision ?? 'start_review') : step,
      body.expectedRecordVersion ?? 0,
    );
    if (result === 'not-found') {
      return failRequest(404, 'NOT_FOUND', `/player-assessments/${step}`);
    }
    return result === 'conflict'
      ? failRequest(409, 'VERSION_CONFLICT', `/player-assessments/${step}`)
      : HttpResponse.json(result);
  });
}

const selfHandlers = [
  http.get(apiUrl('/teams/:teamId/my-assessments'), ({ request }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/my-assessments');
    }
    const paging = readPaging(request);
    return HttpResponse.json(myAssessmentsResponse(paging.limit, paging.offset));
  }),
  http.get(apiUrl('/teams/:teamId/my-feedback'), ({ request }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/my-feedback');
    }
    const paging = readPaging(request);
    return HttpResponse.json(myFeedbackResponse(paging.limit, paging.offset));
  }),
  http.post(
    apiUrl('/teams/:teamId/my-feedback/:feedbackId/acknowledge'),
    async ({ request, params }) => {
      if (!isAuthorized(request)) {
        return failRequest(401, 'UNAUTHORIZED', '/my-feedback');
      }
      const body = await readJsonBody<VersionBody>(request);
      const result = acknowledgeFeedbackRecord(
        pathParam(params, 'feedbackId'),
        body.clarificationRequested === true,
      );
      return result === null
        ? failRequest(404, 'NOT_FOUND', '/my-feedback')
        : HttpResponse.json(result);
    },
  ),
  http.get(apiUrl('/teams/:teamId/my-development-goals'), ({ request }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/my-development-goals');
    }
    const paging = readPaging(request);
    return HttpResponse.json(myGoalsResponse(paging.limit, paging.offset));
  }),
  http.post(
    apiUrl('/teams/:teamId/development-goals/:goalId/transition'),
    async ({ request, params }) => {
      if (!isAuthorized(request)) {
        return failRequest(401, 'UNAUTHORIZED', '/development-goals');
      }
      const body = await readJsonBody<VersionBody>(request);
      const result = transitionGoalRecord(
        pathParam(params, 'goalId'),
        body.transition ?? 'activate',
        body.expectedRecordVersion ?? 0,
      );
      if (result === 'not-found') {
        return failRequest(404, 'NOT_FOUND', '/development-goals');
      }
      return result === 'conflict'
        ? failRequest(409, 'VERSION_CONFLICT', '/development-goals')
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
