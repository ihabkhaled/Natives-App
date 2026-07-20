import type { RemoteQueryView } from '@/shared/view';
import { resolveAsyncViewStatus } from '@/shared/view';

import type { TrainingContextView, TrainingStatus } from '../types/training-view.types';

/**
 * Collapse a training screen's context, its primary query, and whether that
 * query produced anything into the single state the screen presents.
 */
export function resolveTrainingScreenStatus(
  context: TrainingContextView,
  query: RemoteQueryView<unknown>,
  permitted: boolean,
  hasItems: boolean,
): TrainingStatus {
  return resolveAsyncViewStatus({
    isForbidden: !context.isLoading && !permitted,
    isLoading: context.isLoading || query.isLoading,
    hasError: query.error !== null,
    isOffline: context.isOffline,
    hasData: query.data !== undefined,
    hasItems,
  });
}
