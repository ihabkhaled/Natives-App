import { runRequest } from '@/shared/errors';

import { requestQuietHours } from '../gateways/notifications.gateway';
import { mapQuietHours } from '../mappers/notification.mapper';
import type { QuietHours } from '../types/notifications.types';

/** Use case: the caller's quiet-hours window and urgent override. */
export function getQuietHours(): Promise<QuietHours> {
  return runRequest(async () => mapQuietHours(await requestQuietHours()));
}
