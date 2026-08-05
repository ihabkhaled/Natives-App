import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

import type { DRILL_CATEGORIES, DRILL_INTENSITIES, DRILL_STATUSES } from './drills.constants';

type DrillCategoryValue = (typeof DRILL_CATEGORIES)[number];
type DrillIntensityValue = (typeof DRILL_INTENSITIES)[number];
type DrillStatusValue = (typeof DRILL_STATUSES)[number];

/** Translated label per category; the wire value is never shown verbatim. */
export const DRILL_CATEGORY_LABEL_KEYS: Record<DrillCategoryValue, I18nKey> = {
  warmup: I18N_KEYS.drills.categoryWarmup,
  conditioning: I18N_KEYS.drills.categoryConditioning,
  throwing: I18N_KEYS.drills.categoryThrowing,
  cutting: I18N_KEYS.drills.categoryCutting,
  defense: I18N_KEYS.drills.categoryDefense,
  offense: I18N_KEYS.drills.categoryOffense,
  scrimmage: I18N_KEYS.drills.categoryScrimmage,
  set_play: I18N_KEYS.drills.categorySetPlay,
  cooldown: I18N_KEYS.drills.categoryCooldown,
  other: I18N_KEYS.drills.categoryOther,
};

export const DRILL_INTENSITY_LABEL_KEYS: Record<DrillIntensityValue, I18nKey> = {
  low: I18N_KEYS.drills.intensityLow,
  moderate: I18N_KEYS.drills.intensityModerate,
  high: I18N_KEYS.drills.intensityHigh,
  max: I18N_KEYS.drills.intensityMax,
};

export const DRILL_STATUS_LABEL_KEYS: Record<DrillStatusValue, I18nKey> = {
  active: I18N_KEYS.drills.statusActive,
  archived: I18N_KEYS.drills.statusArchived,
};

/**
 * Ionic colour token per status. Archived stays a calm, legible `medium`
 * rather than a muted-to-invisible tone: the product intent is that an
 * archived drill stays visibly distinguishable, never hard to notice.
 */
export const DRILL_STATUS_TONE: Record<DrillStatusValue, string> = {
  active: 'success',
  archived: 'medium',
};
