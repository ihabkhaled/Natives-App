import { I18N_KEYS } from '@/shared/i18n';
import type { ScreenCopyKeys } from '@/shared/view';

/** The five designed states' key sets, one per teams screen. */
export const TEAMS_SCREEN_COPY: ScreenCopyKeys = {
  loadingLabel: I18N_KEYS.common.loading,
  errorTitle: I18N_KEYS.teamsAdmin.errorTitle,
  errorMessage: I18N_KEYS.teamsAdmin.errorMessage,
  retry: I18N_KEYS.common.retry,
  offlineTitle: I18N_KEYS.states.offlineTitle,
  offlineMessage: I18N_KEYS.states.offlineMessage,
  forbiddenTitle: I18N_KEYS.teamsAdmin.forbiddenTitle,
  forbiddenMessage: I18N_KEYS.teamsAdmin.forbiddenMessage,
};

export const SEASONS_SCREEN_COPY: ScreenCopyKeys = {
  loadingLabel: I18N_KEYS.common.loading,
  errorTitle: I18N_KEYS.seasonsAdmin.errorTitle,
  errorMessage: I18N_KEYS.seasonsAdmin.errorMessage,
  retry: I18N_KEYS.common.retry,
  offlineTitle: I18N_KEYS.states.offlineTitle,
  offlineMessage: I18N_KEYS.states.offlineMessage,
  forbiddenTitle: I18N_KEYS.seasonsAdmin.forbiddenTitle,
  forbiddenMessage: I18N_KEYS.seasonsAdmin.forbiddenMessage,
};

export const MATRIX_SCREEN_COPY: ScreenCopyKeys = {
  loadingLabel: I18N_KEYS.common.loading,
  errorTitle: I18N_KEYS.permissionsMatrix.errorTitle,
  errorMessage: I18N_KEYS.permissionsMatrix.errorMessage,
  retry: I18N_KEYS.common.retry,
  offlineTitle: I18N_KEYS.states.offlineTitle,
  offlineMessage: I18N_KEYS.states.offlineMessage,
  forbiddenTitle: I18N_KEYS.permissionsMatrix.forbiddenTitle,
  forbiddenMessage: I18N_KEYS.permissionsMatrix.forbiddenMessage,
};
