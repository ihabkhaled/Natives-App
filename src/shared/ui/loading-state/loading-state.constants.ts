import { TEST_IDS } from '@/shared/config';

import type { LoadingStateVariant } from './loading-state.types';

export const LOADING_STATE_DEFAULT_TEST_ID = TEST_IDS.loadingState;
export const LOADING_STATE_BLOCK_TEST_ID = 'loading-state-skeleton-block';

export const LOADING_STATE_VARIANT_CLASSES: Record<LoadingStateVariant, string> = {
  card: 'app-loading-state--card',
  dashboard: 'app-loading-state--dashboard',
  detail: 'app-loading-state--detail',
  list: 'app-loading-state--list',
};
