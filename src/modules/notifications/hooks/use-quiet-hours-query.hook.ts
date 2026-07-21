import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildQuietHoursQueryOptions } from '../queries/notifications.query';
import type { QuietHours } from '../types/notifications.types';

/** The caller's quiet-hours window and urgent override. */
export function useQuietHoursQuery(): RemoteQueryView<QuietHours> {
  return toRemoteQueryView(useAppQuery<QuietHours>(buildQuietHoursQueryOptions()));
}
