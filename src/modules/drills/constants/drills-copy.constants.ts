import { I18N_KEYS } from '@/shared/i18n';
import { SHARED_SCREEN_COPY_KEYS } from '@/shared/view';

/** The AsyncStateView copy block for the drill list screen. */
export const DRILLS_LIST_SCREEN_COPY_KEYS = {
  loadingLabel: I18N_KEYS.drills.loadingLabel,
  ...SHARED_SCREEN_COPY_KEYS,
} as const;

/** The AsyncStateView copy block for the drill detail/edit screen. */
export const DRILL_DETAIL_SCREEN_COPY_KEYS = {
  loadingLabel: I18N_KEYS.drills.loadingLabel,
  ...SHARED_SCREEN_COPY_KEYS,
} as const;
