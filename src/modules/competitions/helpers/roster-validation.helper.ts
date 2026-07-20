import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  SEVERITY_LABEL_KEYS,
  SEVERITY_TONES,
  VIOLATION_LABEL_KEYS,
} from '../constants/rosters-labels.constants';
import { EMPTY_COMPOSITION } from '../constants/rosters.constants';
import type { FactRowView } from '../types/competitions-view.types';
import type { RosterValidationPanelView } from '../types/rosters-view.types';
import type { RosterComposition, RosterValidation } from '../types/rosters.types';

type Translate = (key: string, params?: TranslateParams) => string;

function compositionFacts(t: Translate, composition: RosterComposition): readonly FactRowView[] {
  return [
    {
      key: 'selected',
      label: t(I18N_KEYS.rosters.compositionSelected),
      value: String(composition.selected),
    },
    {
      key: 'women',
      label: t(I18N_KEYS.rosters.compositionWomen),
      value: String(composition.women),
    },
    { key: 'men', label: t(I18N_KEYS.rosters.compositionMen), value: String(composition.men) },
    {
      key: 'mixed',
      label: t(I18N_KEYS.rosters.compositionMixed),
      value: String(composition.mixed),
    },
    {
      key: 'unknown',
      label: t(I18N_KEYS.rosters.compositionUnknown),
      value: String(composition.unknownGender),
    },
    {
      key: 'offense',
      label: t(I18N_KEYS.rosters.compositionOffense),
      value: String(composition.offense),
    },
    {
      key: 'defense',
      label: t(I18N_KEYS.rosters.compositionDefense),
      value: String(composition.defense),
    },
    {
      key: 'flexible',
      label: t(I18N_KEYS.rosters.compositionFlexible),
      value: String(composition.flexible),
    },
    {
      key: 'captains',
      label: t(I18N_KEYS.rosters.compositionCaptains),
      value: String(composition.captains),
    },
    {
      key: 'missingJersey',
      label: t(I18N_KEYS.rosters.compositionMissingJersey),
      value: String(composition.missingJersey),
    },
  ];
}

/**
 * The validation preview. The server owns the policy; this only translates
 * the verdict and the violations it reported.
 */
export function buildValidationPanel(
  t: Translate,
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
    composition: compositionFacts(t, validation?.composition ?? EMPTY_COMPOSITION),
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
