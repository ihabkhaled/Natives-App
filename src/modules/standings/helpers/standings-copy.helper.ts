import type { AppError } from '@/shared/errors/app.errors';
import { I18N_KEYS } from '@/shared/i18n';
import { buildScreenCopy, type ScreenCopy } from '@/shared/view';

type Translate = (key: string) => string;

export interface StandingsCopyInput {
  readonly error: AppError | null;
  readonly isOffline: boolean;
  readonly onRetry: () => void;
  readonly emptyTitleKey: string;
  readonly emptyMessageKey: string;
}

/**
 * The standings namespace bound to the shared screen-copy builder, so the
 * four screens of this module share one async/guard/empty copy block.
 */
export function buildStandingsScreenCopy(t: Translate, input: StandingsCopyInput): ScreenCopy {
  return buildScreenCopy(t, {
    ...input,
    keys: {
      loadingLabel: I18N_KEYS.standings.loadingLabel,
      errorTitle: I18N_KEYS.standings.errorTitle,
      errorMessage: I18N_KEYS.standings.errorMessage,
      retry: I18N_KEYS.standings.retry,
      offlineTitle: I18N_KEYS.standings.offlineTitle,
      offlineMessage: I18N_KEYS.standings.offlineMessage,
      forbiddenTitle: I18N_KEYS.standings.forbiddenTitle,
      forbiddenMessage: I18N_KEYS.standings.forbiddenMessage,
    },
  });
}
