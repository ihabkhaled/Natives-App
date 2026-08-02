import type { AppError } from '@/shared/errors';
import { I18N_KEYS } from '@/shared/i18n';
import type { AsyncViewStatus } from '@/shared/ui';
import {
  buildScreenCopy,
  resolveScreenStatus,
  type RemoteQueryView,
  type ScreenCopy,
} from '@/shared/view';

type Translate = (key: string) => string;

/** The two newsroom namespaces, keyed the way the shared copy builder wants. */
const PUBLIC_KEYS = {
  loadingLabel: I18N_KEYS.news.loading,
  errorTitle: I18N_KEYS.news.errorTitle,
  errorMessage: I18N_KEYS.news.errorMessage,
  retry: I18N_KEYS.common.retry,
  offlineTitle: I18N_KEYS.news.offlineTitle,
  offlineMessage: I18N_KEYS.news.offlineMessage,
  forbiddenTitle: I18N_KEYS.news.forbiddenTitle,
  forbiddenMessage: I18N_KEYS.news.forbiddenMessage,
} as const;

const EDITOR_KEYS = {
  loadingLabel: I18N_KEYS.newsEditor.loading,
  errorTitle: I18N_KEYS.newsEditor.errorTitle,
  errorMessage: I18N_KEYS.newsEditor.errorMessage,
  retry: I18N_KEYS.common.retry,
  offlineTitle: I18N_KEYS.newsEditor.offlineTitle,
  offlineMessage: I18N_KEYS.newsEditor.offlineMessage,
  forbiddenTitle: I18N_KEYS.newsEditor.forbiddenTitle,
  forbiddenMessage: I18N_KEYS.newsEditor.forbiddenMessage,
} as const;

const PUBLIC_EMPTY_KEYS = {
  live: { title: I18N_KEYS.news.emptyTitle, message: I18N_KEYS.news.emptyMessage },
  pending: { title: I18N_KEYS.news.comingSoonTitle, message: I18N_KEYS.news.comingSoonMessage },
} as const;

const EDITOR_EMPTY_KEYS = {
  live: { title: I18N_KEYS.newsEditor.emptyTitle, message: I18N_KEYS.newsEditor.emptyMessage },
  pending: {
    title: I18N_KEYS.newsEditor.comingSoonTitle,
    message: I18N_KEYS.newsEditor.comingSoonMessage,
  },
} as const;

export interface NewsCopyInput {
  readonly error: AppError | null;
  readonly isOffline: boolean;
  readonly onRetry: () => void;
  /** `NEWS_ENDPOINTS_ENABLED`, passed in so the choice below stays testable. */
  readonly isSeamLive: boolean;
}

interface EmptyCopyKeys {
  readonly title: string;
  readonly message: string;
}

/**
 * "Nothing to read" and "not connected yet" look identical to a visitor unless
 * we say which one it is. While the 1.8.0 endpoints are stubbed the empty
 * state carries the coming-soon copy; the day the seam flips it becomes the
 * ordinary empty state with no screen change.
 */
export function selectEmptyCopyKeys(
  isSeamLive: boolean,
  keys: { readonly live: EmptyCopyKeys; readonly pending: EmptyCopyKeys },
): EmptyCopyKeys {
  return isSeamLive ? keys.live : keys.pending;
}

/** The five designed states for the public list and article screens. */
export function buildPublicNewsCopy(t: Translate, input: NewsCopyInput): ScreenCopy {
  const empty = selectEmptyCopyKeys(input.isSeamLive, PUBLIC_EMPTY_KEYS);
  return buildScreenCopy(t, {
    ...input,
    keys: PUBLIC_KEYS,
    emptyTitleKey: empty.title,
    emptyMessageKey: empty.message,
  });
}

/** The five designed states for the permissioned newsroom. */
export function buildNewsEditorCopy(t: Translate, input: NewsCopyInput): ScreenCopy {
  const empty = selectEmptyCopyKeys(input.isSeamLive, EDITOR_EMPTY_KEYS);
  return buildScreenCopy(t, {
    ...input,
    keys: EDITOR_KEYS,
    emptyTitleKey: empty.title,
    emptyMessageKey: empty.message,
  });
}

/**
 * The advisory line the newsroom pins above the editor while writes go
 * nowhere, so an author is never left to infer it from a silent form.
 */
export function buildNewsSeamNotice(t: Translate, isSeamLive: boolean): string | null {
  return isSeamLive ? null : t(I18N_KEYS.newsEditor.comingSoonMessage);
}

/**
 * Which toast a completed write earns. While the seam is a stub the author is
 * told plainly that nothing was sent — reporting "saved" for a write that
 * never left the browser is the one thing a seam must not do.
 */
export function selectWriteToastKey(
  isSeamLive: boolean,
  liveKey: string,
  pendingKey: string,
): string {
  return isSeamLive ? liveKey : pendingKey;
}

/** The newsroom scope bound to the shared status resolver. */
export function resolveNewsScreenStatus(
  scope: { readonly isOffline: boolean; readonly isLoading: boolean },
  query: RemoteQueryView<unknown>,
  permitted: boolean,
  hasItems: boolean,
): AsyncViewStatus {
  return resolveScreenStatus(scope, query, permitted, hasItems);
}
