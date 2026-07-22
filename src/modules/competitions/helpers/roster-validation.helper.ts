import type { TranslateParams } from '@/packages/i18n';
import { formatNumber } from '@/packages/number';
import { I18N_KEYS } from '@/shared/i18n';

import {
  ROSTER_COMPOSITION_ROWS,
  SEVERITY_LABEL_KEYS,
  SEVERITY_TONES,
  VIOLATION_LABEL_KEYS,
} from '../constants/rosters-labels.constants';
import { EMPTY_COMPOSITION } from '../constants/rosters.constants';
import type { FactRowView } from '../types/competitions-view.types';
import type { RosterValidationPanelView } from '../types/rosters-view.types';
import type { RosterComposition, RosterValidation } from '../types/rosters.types';

type Translate = (key: string, params?: TranslateParams) => string;

function compositionFacts(
  t: Translate,
  locale: string,
  composition: RosterComposition,
): readonly FactRowView[] {
  return ROSTER_COMPOSITION_ROWS.map((row) => ({
    key: row.key,
    label: t(row.labelKey),
    value: formatNumber(composition[row.field], locale),
  }));
}

/**
 * The validation preview. The server owns the policy; this only translates
 * the verdict and the violations it reported.
 */
export function buildValidationPanel(
  t: Translate,
  locale: string,
  validation: RosterValidation | null,
): RosterValidationPanelView {
  const publishable = validation?.publishable === true;
  return {
    heading: t(I18N_KEYS.rosters.validationHeading),
    intro: t(I18N_KEYS.rosters.validationIntro),
    verdictLabel: publishable
      ? t(I18N_KEYS.rosters.validationPublishable)
      : t(I18N_KEYS.rosters.validationBlocked),
    verdictTone: publishable ? 'success' : 'warning',
    compositionHeading: t(I18N_KEYS.rosters.compositionHeading),
    composition: compositionFacts(t, locale, validation?.composition ?? EMPTY_COMPOSITION),
    violationsHeading: t(I18N_KEYS.rosters.violationsHeading),
    violationsEmptyLabel: t(I18N_KEYS.rosters.violationsEmpty),
    violations: (validation?.violations ?? []).map((violation) => ({
      key: violation.code,
      label: t(VIOLATION_LABEL_KEYS[violation.code]),
      severityLabel: t(SEVERITY_LABEL_KEYS[violation.severity]),
      tone: SEVERITY_TONES[violation.severity],
    })),
  };
}
