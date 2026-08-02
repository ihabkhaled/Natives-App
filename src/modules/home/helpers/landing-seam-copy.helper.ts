import { SHARED_SCREEN_COPY_KEYS } from '@/shared/view';
import type { AsyncViewStatus } from '@/shared/ui';
import { I18N_KEYS } from '@/shared/i18n';
import { buildScreenCopy, resolveAsyncViewStatus, type ScreenCopy } from '@/shared/view';

type Translate = (key: string) => string;

/**
 * The landing page's "TODO seam" sections (leadership, players, competitions,
 * matches, leaderboard, news) have no live query yet — contract 1.8.0 is in
 * flight. Every seam still renders through the exact same `AsyncStateView`
 * machinery a real query would use, so wiring the real query later is a
 * one-file swap with zero layout rework: only `status`/`hasItems` start
 * coming from a query instead of a stub.
 */
const LANDING_SEAM_COPY_KEYS = {
  loadingLabel: I18N_KEYS.common.loading,
  ...SHARED_SCREEN_COPY_KEYS,
} as const;

export interface LandingSeamChrome extends ScreenCopy {
  readonly status: AsyncViewStatus;
}

function noop(): void {
  // The stub seam has nothing to retry yet; the real query wires a live
  // refetch into this same slot once contract 1.8.0 ships.
}

/** Resolve a seam's presented state from whether its stub has any items. */
export function resolveLandingSeamStatus(hasItems: boolean): AsyncViewStatus {
  return resolveAsyncViewStatus({
    isForbidden: false,
    isLoading: false,
    hasError: false,
    isOffline: false,
    hasData: true,
    hasItems,
  });
}

/** The shared AsyncStateView copy block, specialized only by empty-state copy. */
export function buildLandingSeamChrome(
  t: Translate,
  hasItems: boolean,
  emptyTitleKey: string,
  emptyMessageKey: string,
): LandingSeamChrome {
  const copy = buildScreenCopy(t, {
    keys: LANDING_SEAM_COPY_KEYS,
    error: null,
    isOffline: false,
    onRetry: noop,
    emptyTitleKey,
    emptyMessageKey,
  });
  return { ...copy, status: resolveLandingSeamStatus(hasItems) };
}
