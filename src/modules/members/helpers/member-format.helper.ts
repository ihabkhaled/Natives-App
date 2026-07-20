import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  AGE_CLASSIFICATION_LABEL_KEYS,
  PLAYER_GENDER_LABEL_KEYS,
  type AgeClassification,
  type PlayerGender,
} from '../constants/members.constants';

type Translate = (key: string, params?: TranslateParams) => string;

/** Positions are backend keys joined for a compact, dot-separated summary. */
const POSITION_SEPARATOR = ' · ';

/** Translated `#12` jersey label, or null when no number is set. */
export function formatJerseyLabel(t: Translate, jerseyNumber: number | null): string | null {
  return jerseyNumber === null ? null : t(I18N_KEYS.members.jerseyLabel, { number: jerseyNumber });
}

/** Compact positions summary, or null when the member has no positions. */
export function formatPositionsSummary(positions: readonly string[]): string | null {
  return positions.length === 0 ? null : positions.join(POSITION_SEPARATOR);
}

/** Translated gender label, or null when undisclosed/absent. */
export function formatGender(t: Translate, gender: PlayerGender | null): string | null {
  return gender === null ? null : t(PLAYER_GENDER_LABEL_KEYS[gender]);
}

/** Translated age-group label, or null when the date of birth is unknown. */
export function formatAgeClassification(
  t: Translate,
  age: AgeClassification | null,
): string | null {
  return age === null ? null : t(AGE_CLASSIFICATION_LABEL_KEYS[age]);
}

/** Height rendered with its unit, or null when not provided. */
export function formatHeight(t: Translate, heightCm: number | null): string | null {
  return heightCm === null ? null : t(I18N_KEYS.members.heightUnit, { value: heightCm });
}

/** Weight rendered with its unit, or null when not provided. */
export function formatWeight(t: Translate, weightKg: number | null): string | null {
  return weightKg === null ? null : t(I18N_KEYS.members.weightUnit, { value: weightKg });
}
