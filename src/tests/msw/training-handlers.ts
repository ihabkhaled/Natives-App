import { http, HttpResponse } from 'msw';

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
import {
  decideReviewRecord,
  reviewDetailResponse,
  reviewQueueResponse,
} from './training-review.fixture';
import {
  activityTypesResponse,
  buddiesResponse,
  createSubmissionRecord,
  evidenceResponse,
  mySubmissionsResponse,
  respondToBuddyRecord,
  submissionDetailResponse,
  transitionSubmission,
  type CreateSubmissionBody,
} from './training.fixture';

interface VersionBody {
  readonly expectedRecordVersion?: number;
}

function trainingUrl(suffix: string): string {
  return apiUrl(`/teams/:teamId${suffix}`);
}

const submissionHandlers = [
  http.get(trainingUrl('/activity-types'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(activityTypesResponse())
      : failRequest(401, 'UNAUTHORIZED', '/activity-types'),
  ),
  http.get(trainingUrl('/activity-submissions'), ({ request }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/activity-submissions');
    }
    const paging = readPaging(request);
    return HttpResponse.json(mySubmissionsResponse(paging.limit, paging.offset));
  }),
  http.post(trainingUrl('/activity-submissions'), async ({ request }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/activity-submissions');
    }
    const body = await readJsonBody<CreateSubmissionBody>(request);
    if (body.activityTypeId === undefined || body.performedOn === undefined) {
      return failRequest(400, 'VALIDATION_ERROR', '/activity-submissions');
    }
    return HttpResponse.json(createSubmissionRecord(body), { status: 201 });
  }),
  http.get(trainingUrl('/activity-submissions/:submissionId'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/activity-submissions');
    }
    const detail = submissionDetailResponse(pathParam(params, 'submissionId'));
    return detail === null
      ? failRequest(404, 'NOT_FOUND', '/activity-submissions')
      : HttpResponse.json(detail);
  }),
  http.get(trainingUrl('/activity-submissions/:submissionId/evidence'), ({ request, params }) =>
    isAuthorized(request)
      ? HttpResponse.json(evidenceResponse(pathParam(params, 'submissionId')))
      : failRequest(401, 'UNAUTHORIZED', '/activity-submissions'),
  ),
  // Gated on activity.read.self exactly like the backend: an analyst holds
  // team reads only and receives an honest 403 on every self route.
  http.get(trainingUrl('/my-activity-buddies'), ({ request }) =>
    permissionsForRequest(request).includes(PERMISSIONS.activityReadSelf)
      ? HttpResponse.json(buddiesResponse())
      : failRequest(403, 'FORBIDDEN', '/my-activity-buddies'),
  ),
];

const buddyResponseHandlers = (['confirm', 'decline'] as const).map((intent) =>
  http.post(trainingUrl(`/my-activity-buddies/:buddyId/${intent}`), ({ request, params }) => {
    if (!permissionsForRequest(request).includes(PERMISSIONS.activitySubmitSelf)) {
      return failRequest(403, 'FORBIDDEN', '/my-activity-buddies');
    }
    const result = respondToBuddyRecord(pathParam(params, 'buddyId'), intent);
    return result === null
      ? failRequest(404, 'NOT_FOUND', '/my-activity-buddies')
      : HttpResponse.json(result);
  }),
);

const transitionHandlers = (['submit', 'withdraw'] as const).map((intent) =>
  http.post(
    trainingUrl(`/activity-submissions/:submissionId/${intent}`),
    async ({ request, params }) => {
      if (!isAuthorized(request)) {
        return failRequest(401, 'UNAUTHORIZED', '/activity-submissions');
      }
      const body = await readJsonBody<VersionBody>(request);
      const result = transitionSubmission(
        pathParam(params, 'submissionId'),
        body.expectedRecordVersion ?? 0,
        intent,
      );
      if (result === 'not-found') {
        return failRequest(404, 'NOT_FOUND', '/activity-submissions');
      }
      return result === 'conflict'
        ? failRequest(409, 'VERSION_CONFLICT', '/activity-submissions')
        : HttpResponse.json(result);
    },
  ),
);

const reviewHandlers = [
  http.get(trainingUrl('/activity-review'), ({ request }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/activity-review');
    }
    const status = new URL(request.url).searchParams.get('status');
    return HttpResponse.json(reviewQueueResponse(status));
  }),
  http.get(trainingUrl('/activity-review/:submissionId'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/activity-review');
    }
    const detail = reviewDetailResponse(pathParam(params, 'submissionId'));
    return detail === null
      ? failRequest(404, 'NOT_FOUND', '/activity-review')
      : HttpResponse.json(detail);
  }),
];

const decisionHandlers = (['approve', 'reject', 'request-changes'] as const).map((decision) =>
  http.post(
    trainingUrl(`/activity-review/:submissionId/${decision}`),
    async ({ request, params }) => {
      if (!isAuthorized(request)) {
        return failRequest(401, 'UNAUTHORIZED', '/activity-review');
      }
      const body = await readJsonBody<VersionBody>(request);
      const result = decideReviewRecord(
        pathParam(params, 'submissionId'),
        decision,
        body.expectedRecordVersion ?? 0,
      );
      if (result === 'not-found') {
        return failRequest(404, 'NOT_FOUND', '/activity-review');
      }
      return result === 'conflict'
        ? failRequest(409, 'VERSION_CONFLICT', '/activity-review')
        : HttpResponse.json(result);
    },
  ),
);

/** NestJS-shaped activities handlers; the same Zod schemas parse both modes. */
export const trainingHandlers = [
  ...submissionHandlers,
  ...buddyResponseHandlers,
  ...transitionHandlers,
  ...reviewHandlers,
  ...decisionHandlers,
];
