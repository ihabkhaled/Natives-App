import { getAppHttpClient } from '@/packages/http';

import {
  reminderDispatchPath,
  reminderPreviewPath,
  reminderStatusPath,
  reminderTestPath,
} from '../constants/practice-reminders-api.constants';
import { toReminderTestResult } from '../mappers/practice-reminders.mapper';
import {
  reminderDispatchResponseSchema,
  reminderStatusResponseSchema,
  reminderTestResponseSchema,
} from '../schemas/practice-reminders.schema';
import type {
  ReminderDispatchResult,
  ReminderRequestParams,
  ReminderStatus,
  ReminderTestResult,
} from '../types/practice-reminders.types';

/** The coach's read-only view of where this session's reminders stand. */
export function requestReminderStatus(params: ReminderRequestParams): Promise<ReminderStatus> {
  return getAppHttpClient().get(
    reminderStatusPath(params.teamId, params.sessionId),
    reminderStatusResponseSchema,
  );
}

/**
 * The dry run. Same shape as status because it answers the same question —
 * what would go out — but it is the dispatcher's own reckoning rather than a
 * cached view, so the screen refreshes from it before offering to send.
 */
export function requestReminderPreview(params: ReminderRequestParams): Promise<ReminderStatus> {
  return getAppHttpClient().get(
    reminderPreviewPath(params.teamId, params.sessionId),
    reminderStatusResponseSchema,
  );
}

/**
 * Send the reminders that are due. `candidates` and `enqueued` come back
 * separately: a recipient inside quiet hours, or one already reminded, is a
 * candidate that was deliberately not queued, and the caller reports that gap
 * rather than claiming everyone was reached.
 */
export function requestReminderDispatch(
  params: ReminderRequestParams,
): Promise<ReminderDispatchResult> {
  return getAppHttpClient().post(
    reminderDispatchPath(params.teamId, params.sessionId),
    {},
    reminderDispatchResponseSchema,
  );
}

/**
 * Send one reminder to the caller. The recipient is resolved from the token,
 * never from a parameter, so this cannot be aimed at the roster by mistake.
 */
export async function requestReminderTest(
  params: ReminderRequestParams,
): Promise<ReminderTestResult> {
  const dto = await getAppHttpClient().post(
    reminderTestPath(params.teamId, params.sessionId),
    {},
    reminderTestResponseSchema,
  );
  return toReminderTestResult(dto);
}
