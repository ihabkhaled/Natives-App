import type { AppError } from '@/shared/errors/app.errors';
import { I18N_KEYS } from '@/shared/i18n';
import { buildScreenCopy, type ScreenCopy } from '@/shared/view';

type Translate = (key: string) => string;

export interface ReportsCopyInput {
  readonly error: AppError | null;
  readonly isOffline: boolean;
  readonly onRetry: () => void;
}

/** The reports namespace bound to the shared screen-copy builder. */
export function buildReportsScreenCopy(t: Translate, input: ReportsCopyInput): ScreenCopy {
  return buildScreenCopy(t, {
    ...input,
    keys: {
      loadingLabel: I18N_KEYS.reports.loadingLabel,
      errorTitle: I18N_KEYS.reports.errorTitle,
      errorMessage: I18N_KEYS.reports.errorMessage,
      retry: I18N_KEYS.reports.retry,
      offlineTitle: I18N_KEYS.reports.offlineTitle,
      offlineMessage: I18N_KEYS.reports.offlineMessage,
      forbiddenTitle: I18N_KEYS.reports.forbiddenTitle,
      forbiddenMessage: I18N_KEYS.reports.forbiddenMessage,
    },
    emptyTitleKey: I18N_KEYS.reports.emptyTitle,
    emptyMessageKey: I18N_KEYS.reports.emptyMessage,
  });
}
