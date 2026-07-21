import { runRequest } from '@/shared/errors';

import { requestUpdateQuietHours } from '../gateways/notifications.gateway';
import { mapQuietHours } from '../mappers/notification.mapper';
import type { QuietHours } from '../types/notifications.types';

/** Use case: save the quiet-hours window and its urgent override. */
export function updateQuietHours(command: QuietHours): Promise<QuietHours> {
  return runRequest(async () => mapQuietHours(await requestUpdateQuietHours(command)));
}
