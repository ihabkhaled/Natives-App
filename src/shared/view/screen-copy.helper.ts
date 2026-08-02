import { I18N_KEYS } from '../i18n';
import type { AppError } from '../errors/app.errors';
import { mapErrorCodeToI18nKey } from '../mappers';
import type { AsyncViewStatus } from '../ui';
import type { AsyncViewCopy } from '../types';
import { resolveAsyncViewStatus } from './async-status.helper';
import type { RemoteQueryView } from './query-view.helper';

/** The i18n keys one feature namespace supplies for the shared state block. */
export interface ScreenCopyKeys {
  readonly loadingLabel: string;
  readonly errorTitle: string;
  readonly errorMessage: string;
  readonly retry: string;
  readonly offlineTitle: string;
  readonly offlineMessage: string;
  readonly forbiddenTitle: string;
  readonly forbiddenMessage: string;
}

/**
 * The seven keys that are the same on every screen. Only `loadingLabel` is
 * genuinely per-feature, so callers spread this and supply that one key.
 */
export const SHARED_SCREEN_COPY_KEYS = {
  errorTitle: I18N_KEYS.states.errorTitle,
  errorMessage: I18N_KEYS.errors.unexpected,
  retry: I18N_KEYS.common.retry,
  offlineTitle: I18N_KEYS.states.offlineTitle,
  offlineMessage: I18N_KEYS.states.offlineMessage,
  forbiddenTitle: I18N_KEYS.states.permissionTitle,
  forbiddenMessage: I18N_KEYS.states.permissionMessage,
} as const satisfies Omit<ScreenCopyKeys, 'loadingLabel'>;

/** The async + guard + empty copy block every screen renders. */
export interface ScreenCopy extends AsyncViewCopy {
  readonly forbiddenTitle: string;
  readonly forbiddenMessage: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
}

export interface ScreenCopyInput {
  readonly keys: ScreenCopyKeys;
  readonly error: AppError | null;
  readonly isOffline: boolean;
  readonly onRetry: () => void;
  readonly emptyTitleKey: string;
  readonly emptyMessageKey: string;
}

type Translate = (key: string) => string;

/**
 * Build the five designed states' copy once, from one namespace's keys. A
 * real failure is mapped through the sanitized error table, so a raw backend
 * message can never reach a screen.
 */
export function buildScreenCopy(t: Translate, input: ScreenCopyInput): ScreenCopy {
  const keys = input.keys;
  return {
    loadingLabel: t(keys.loadingLabel),
    errorTitle: t(keys.errorTitle),
    errorMessage:
      input.error === null ? t(keys.errorMessage) : t(mapErrorCodeToI18nKey(input.error.code)),
    retryLabel: t(keys.retry),
    onRetry: input.onRetry,
    offlineTitle: t(keys.offlineTitle),
    offlineMessage: t(keys.offlineMessage),
    offlineNoticeLabel: t(keys.offlineMessage),
    isOffline: input.isOffline,
    forbiddenTitle: t(keys.forbiddenTitle),
    forbiddenMessage: t(keys.forbiddenMessage),
    emptyTitle: t(input.emptyTitleKey),
    emptyMessage: t(input.emptyMessageKey),
  };
}

/** The scope facts the shared status resolver reads. */
export interface ScreenScope {
  readonly isOffline: boolean;
  readonly isLoading: boolean;
}

/**
 * Collapse a screen's scope, its primary query, and whether that query
 * produced anything into the single state the screen presents.
 */
export function resolveScreenStatus(
  scope: ScreenScope,
  query: RemoteQueryView<unknown>,
  permitted: boolean,
  hasItems: boolean,
): AsyncViewStatus {
  return resolveAsyncViewStatus({
    isForbidden: !scope.isLoading && !permitted,
    isLoading: scope.isLoading || query.isLoading,
    hasError: query.error !== null,
    isOffline: scope.isOffline,
    hasData: query.data !== undefined,
    hasItems,
  });
}
