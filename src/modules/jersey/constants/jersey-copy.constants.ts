import { I18N_KEYS } from '@/shared/i18n';
import { SHARED_SCREEN_COPY_KEYS } from '@/shared/view';

/** The AsyncStateView copy block for the jersey orders screen. */
export const JERSEY_SCREEN_COPY_KEYS = {
  loadingLabel: I18N_KEYS.jersey.loadingLabel,
  ...SHARED_SCREEN_COPY_KEYS,
} as const;
