import { I18N_KEYS } from '@/shared/i18n';
import { SHARED_SCREEN_COPY_KEYS } from '@/shared/view';

/** The AsyncStateView copy block for the operations queue. */
export const DATA_QUALITY_SCREEN_COPY_KEYS = {
  loadingLabel: I18N_KEYS.dataQuality.loadingLabel,
  ...SHARED_SCREEN_COPY_KEYS,
} as const;
