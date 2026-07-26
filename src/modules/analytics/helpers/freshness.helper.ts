import { formatRelativeToNow } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { ANALYTICS_LIMITS } from '../constants/analytics.constants';

type Translate = (key: string, params?: TranslateParams) => string;

const MILLISECONDS_PER_HOUR = 3_600_000;

/**
 * Whether a projection is older than the staleness policy (24 h) — the cue
 * for the freshness card's warning and, for data-quality holders, the
 * rebuild affordance.
 */
export function isProjectionStale(computedAtIso: string | null, nowMs: number): boolean {
  if (computedAtIso === null) {
    return true;
  }
  const ageMs = nowMs - Date.parse(computedAtIso);
  return ageMs > ANALYTICS_LIMITS.staleAfterHours * MILLISECONDS_PER_HOUR;
}

/** The computed-at citation, relative-formatted, honest about "never". */
export function formatComputedAt(
  t: Translate,
  locale: string,
  computedAtIso: string | null,
): string {
  if (computedAtIso === null) {
    return t(I18N_KEYS.analytics.computedAtUnknown);
  }
  return t(I18N_KEYS.analytics.computedAtLabel, {
    ago: formatRelativeToNow(computedAtIso, locale),
  });
}

/** The freshness status line: fresh / stale / never computed. */
export function buildFreshnessStatus(
  t: Translate,
  locale: string,
  computedAtIso: string | null,
  nowMs: number,
): { readonly label: string; readonly isStale: boolean } {
  if (computedAtIso === null) {
    return { label: t(I18N_KEYS.analytics.freshnessNever), isStale: true };
  }
  const stale = isProjectionStale(computedAtIso, nowMs);
  return {
    label: t(stale ? I18N_KEYS.analytics.freshnessStale : I18N_KEYS.analytics.freshnessFresh, {
      ago: formatRelativeToNow(computedAtIso, locale),
    }),
    isStale: stale,
  };
}
