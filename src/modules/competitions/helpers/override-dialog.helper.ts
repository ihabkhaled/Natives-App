import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type { EligibilityCandidate } from '../types/competitions.types';
import type { OverrideDialogView } from '../types/competitions-view.types';
import { isOverrideReasonValid } from './eligibility-view.helper';

type Translate = (key: string, params?: TranslateParams) => string;

/** Everything the override dialog needs from its owning hook. */
export interface OverrideDialogInput {
  readonly candidate: EligibilityCandidate;
  readonly reason: string;
  readonly isSaving: boolean;
  readonly onReasonChange: (value: string) => void;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

/**
 * The coach-override dialog. `canConfirm` stays false until a reason of at
 * least the server's minimum length is typed, so an override can never be
 * recorded without its justification.
 */
export function buildOverrideDialog(t: Translate, input: OverrideDialogInput): OverrideDialogView {
  const isValid = isOverrideReasonValid(input.reason);
  return {
    heading: t(I18N_KEYS.squads.overrideHeading),
    intro: t(I18N_KEYS.squads.overrideIntro),
    candidateName: input.candidate.fullName,
    reasonLabel: t(I18N_KEYS.squads.overrideReasonLabel),
    reasonPlaceholder: t(I18N_KEYS.squads.overrideReasonPlaceholder),
    reasonValue: input.reason,
    validationMessage: isValid ? null : t(I18N_KEYS.squads.overrideReasonRequired),
    confirmLabel: t(I18N_KEYS.squads.overrideConfirm),
    cancelLabel: t(I18N_KEYS.squads.overrideCancel),
    canConfirm: isValid && !input.isSaving,
    isSaving: input.isSaving,
    onReasonChange: input.onReasonChange,
    onConfirm: input.onConfirm,
    onCancel: input.onCancel,
  };
}
