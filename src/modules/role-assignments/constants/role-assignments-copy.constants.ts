import { I18N_KEYS } from '@/shared/i18n';
import { SHARED_SCREEN_COPY_KEYS } from '@/shared/view';

/** The AsyncStateView copy block for the role-assignments admin screen. */
export const ROLE_ASSIGNMENTS_SCREEN_COPY_KEYS = {
  loadingLabel: I18N_KEYS.roleAssignments.loadingLabel,
  ...SHARED_SCREEN_COPY_KEYS,
} as const;
