import { http, HttpResponse } from 'msw';

import {
  apiUrl,
  failRequest,
  isAuthorized,
  pathParam,
  readJsonBody,
  readPaging,
} from './mock-request.helper';
import {
  markNotificationReadRecord,
  notificationsResponse,
  preferencesResponse,
  quietHoursResponse,
  updatePreferenceRecord,
  updateQuietHoursRecord,
} from './notifications.fixture';

interface PreferenceBody {
  readonly category?: string;
  readonly channel?: string;
  readonly enabled?: boolean;
}

interface QuietHoursBody {
  readonly timezone?: string;
  readonly startsLocal?: string;
  readonly endsLocal?: string;
  readonly urgentCancellationOverride?: boolean;
}

/**
 * Notification handlers. These mirror the deployed platform module contract;
 * the same Zod schemas validate them and the remote responses unchanged.
 */
export const notificationsHandlers = [
  http.get(apiUrl('/notifications'), ({ request }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/notifications');
    }
    const paging = readPaging(request);
    return HttpResponse.json(notificationsResponse(paging.limit, paging.offset));
  }),
  http.post(apiUrl('/notifications/:notificationId/read'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/notifications');
    }
    const record = markNotificationReadRecord(pathParam(params, 'notificationId'));
    return record === null
      ? failRequest(404, 'NOT_FOUND', '/notifications')
      : HttpResponse.json(record);
  }),
  http.get(apiUrl('/notifications/preferences'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(preferencesResponse())
      : failRequest(401, 'UNAUTHORIZED', '/notifications/preferences'),
  ),
  http.put(apiUrl('/notifications/preferences'), async ({ request }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/notifications/preferences');
    }
    const body = await readJsonBody<PreferenceBody>(request);
    if (body.category === undefined || body.channel === undefined) {
      return failRequest(400, 'VALIDATION_ERROR', '/notifications/preferences');
    }
    return HttpResponse.json(
      updatePreferenceRecord(body.category, body.channel, body.enabled === true),
    );
  }),
  http.get(apiUrl('/notifications/quiet-hours'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(quietHoursResponse())
      : failRequest(401, 'UNAUTHORIZED', '/notifications/quiet-hours'),
  ),
  http.put(apiUrl('/notifications/quiet-hours'), async ({ request }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/notifications/quiet-hours');
    }
    const body = await readJsonBody<QuietHoursBody>(request);
    if (body.startsLocal === undefined || body.endsLocal === undefined) {
      return failRequest(400, 'VALIDATION_ERROR', '/notifications/quiet-hours');
    }
    return HttpResponse.json(
      updateQuietHoursRecord({
        timezone: body.timezone ?? 'Africa/Cairo',
        startsLocal: body.startsLocal,
        endsLocal: body.endsLocal,
        urgentCancellationOverride: body.urgentCancellationOverride === true,
      }),
    );
  }),
];
