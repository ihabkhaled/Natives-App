import type { TranslateParams } from '@/packages/i18n';

import {
  PRACTICE_SCOPE_LABEL_KEYS,
  PRACTICE_SCOPE_OPTIONS,
  PRACTICE_TYPE_LABEL_KEYS,
  PRACTICE_TYPE_OPTIONS,
  RSVP_FILTER_OPTIONS,
  RSVP_STATUS_LABEL_KEYS,
} from '../constants/practice.constants';
import type { PracticeFilterOptions } from '../types/practice-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** Pure translated option lists for the calendar filter bar. */
export function buildPracticeFilterOptions(t: Translate): PracticeFilterOptions {
  return {
    scope: PRACTICE_SCOPE_OPTIONS.map((value) => ({
      value,
      label: t(PRACTICE_SCOPE_LABEL_KEYS[value]),
    })),
    type: PRACTICE_TYPE_OPTIONS.map((value) => ({
      value,
      label: t(PRACTICE_TYPE_LABEL_KEYS[value]),
    })),
    rsvp: RSVP_FILTER_OPTIONS.map((value) => ({
      value,
      label: t(RSVP_STATUS_LABEL_KEYS[value]),
    })),
  };
}
