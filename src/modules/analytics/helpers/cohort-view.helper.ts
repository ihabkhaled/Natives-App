import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { ANALYTICS_LIMITS } from '../constants/analytics.constants';
import type { CohortComparison } from '../types/analytics.types';
import type { CohortTileView } from '../types/analytics-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** The tiles ↔ suppression split of one cohort comparison. */
export interface CohortBodyView {
  readonly tiles: readonly CohortTileView[];
  readonly sampleLabel: string | null;
  readonly suppressedTitle: string | null;
  readonly suppressedMessage: string | null;
}

function tileValue(value: number | null): string {
  return value === null ? '—' : String(value);
}

/**
 * Suppression is a first-class state, not an error: below the privacy
 * threshold the tiles are replaced by the notice explaining why (and at what
 * sample size comparisons unlock). No stat is ever reconstructed client-side.
 */
export function buildCohortBody(t: Translate, cohort: CohortComparison): CohortBodyView {
  if (cohort.suppressed) {
    return {
      tiles: [],
      sampleLabel: null,
      suppressedTitle: t(I18N_KEYS.analytics.cohortSuppressedTitle),
      suppressedMessage: t(I18N_KEYS.analytics.cohortSuppressedMessage, {
        sample: String(cohort.sampleSize),
        threshold: String(ANALYTICS_LIMITS.cohortPrivacyThreshold),
      }),
    };
  }
  return {
    tiles: [
      {
        key: 'minimum',
        label: t(I18N_KEYS.analytics.cohortMinimum),
        value: tileValue(cohort.minimum),
      },
      {
        key: 'average',
        label: t(I18N_KEYS.analytics.cohortAverage),
        value: tileValue(cohort.average),
      },
      {
        key: 'maximum',
        label: t(I18N_KEYS.analytics.cohortMaximum),
        value: tileValue(cohort.maximum),
      },
    ],
    sampleLabel: t(I18N_KEYS.analytics.cohortSampleSize, {
      sample: String(cohort.sampleSize),
    }),
    suppressedTitle: null,
    suppressedMessage: null,
  };
}
