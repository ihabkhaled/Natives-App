import type { AppError } from '@/shared/errors/app.errors';
import { I18N_KEYS } from '@/shared/i18n';
import { buildScreenCopy, type ScreenCopy } from '@/shared/view';

type Translate = (key: string) => string;

export interface AnalyticsCopyInput {
  readonly error: AppError | null;
  readonly isOffline: boolean;
  readonly onRetry: () => void;
}

/**
 * The analytics namespace bound to the shared screen-copy builder, so both
 * screens share one async/guard/empty copy block.
 */
export function buildAnalyticsScreenCopy(t: Translate, input: AnalyticsCopyInput): ScreenCopy {
  return buildScreenCopy(t, {
    ...input,
    keys: {
      loadingLabel: I18N_KEYS.analytics.loadingLabel,
      errorTitle: I18N_KEYS.analytics.errorTitle,
      errorMessage: I18N_KEYS.analytics.errorMessage,
      retry: I18N_KEYS.analytics.retry,
      offlineTitle: I18N_KEYS.analytics.offlineTitle,
      offlineMessage: I18N_KEYS.analytics.offlineMessage,
      forbiddenTitle: I18N_KEYS.analytics.forbiddenTitle,
      forbiddenMessage: I18N_KEYS.analytics.forbiddenMessage,
    },
    emptyTitleKey: I18N_KEYS.analytics.emptyTitle,
    emptyMessageKey: I18N_KEYS.analytics.emptyMessage,
  });
}
