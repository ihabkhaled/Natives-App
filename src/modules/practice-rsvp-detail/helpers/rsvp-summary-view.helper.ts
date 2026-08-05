import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type { RsvpSummaryView } from '../types/practice-rsvp-detail-view.types';
import type { RsvpSummary } from '../types/practice-rsvp-detail.types';

type Translate = (key: string, params?: TranslateParams) => string;

const KEYS = I18N_KEYS.practiceRsvpDetail;

/**
 * Translate the privacy-safe planning counts. `null` for `capacity` and
 * `spotsRemaining` means the session has neither, not zero — a session
 * nobody capped is not a session already full.
 */
export function buildSummaryView(t: Translate, summary: RsvpSummary | undefined): RsvpSummaryView | null {
  if (summary === undefined) {
    return null;
  }
  return {
    headingLabel: t(KEYS.summaryHeading),
    goingLabel: t(KEYS.summaryGoing, { count: summary.going }),
    maybeLabel: t(KEYS.summaryMaybe, { count: summary.maybe }),
    notGoingLabel: t(KEYS.summaryNotGoing, { count: summary.notGoing }),
    noResponseLabel: t(KEYS.summaryNoResponse, { count: summary.noResponse }),
    waitlistedLabel: t(KEYS.summaryWaitlisted, { count: summary.waitlisted }),
    capacityLabel:
      summary.capacity === null
        ? t(KEYS.summaryCapacityUnlimited)
        : t(KEYS.summaryCapacity, { count: summary.capacity }),
    spotsRemainingLabel:
      summary.spotsRemaining === null
        ? t(KEYS.summarySpotsRemainingUnlimited)
        : t(KEYS.summarySpotsRemaining, { count: summary.spotsRemaining }),
  };
}
