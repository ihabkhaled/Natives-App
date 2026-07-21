import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type { ComposerFormState } from '../constants/training-form.constants';
import type {
  ComposerCallbacks,
  TrainingBuddyEditorView,
  TrainingComposerView,
  TrainingEvidenceEditorView,
} from '../types/training-view.types';
import {
  buildActivityTypeOptions,
  buildCandidateLabel,
  hasCandidateValue,
} from './submission-view.helper';
import type { ActivityType } from '../types/training.types';

type Translate = (key: string, params?: TranslateParams) => string;

function durationHint(t: Translate, activityType: ActivityType | null): string | null {
  const min = activityType?.minDurationMinutes ?? null;
  const max = activityType?.maxDurationMinutes ?? null;
  if (min === null || max === null) {
    return null;
  }
  return t(I18N_KEYS.training.durationHint, { min, max });
}

function quantityLabel(t: Translate, activityType: ActivityType | null): string {
  const base = t(I18N_KEYS.training.quantityLabel);
  const unit = activityType?.unit ?? null;
  return unit === null ? base : `${base} (${unit})`;
}

export interface ComposerViewInput {
  readonly form: ComposerFormState;
  readonly activityTypes: readonly ActivityType[];
  readonly selectedType: ActivityType | null;
  readonly validationKey: string | null;
  readonly isSaving: boolean;
  readonly dateMax: string;
  readonly dateLocale: string;
  readonly evidence: TrainingEvidenceEditorView;
  readonly buddies: TrainingBuddyEditorView;
}

/**
 * Assemble the composer's presentational view. The candidate-points readout
 * is the honest one: an unapproved activity type carries no number at all.
 */
export function buildComposerView(
  t: Translate,
  input: ComposerViewInput,
  callbacks: ComposerCallbacks,
): TrainingComposerView {
  return {
    heading: t(I18N_KEYS.training.composerTitle),
    intro: t(I18N_KEYS.training.composerIntro),
    typeLabel: t(I18N_KEYS.training.activityTypeLabel),
    typePlaceholder: t(I18N_KEYS.training.activityTypePlaceholder),
    typeValue: input.form.activityTypeId,
    typeOptions: buildActivityTypeOptions(t, input.activityTypes),
    dateLabel: t(I18N_KEYS.training.performedOnLabel),
    dateValue: input.form.performedOn,
    dateMax: input.dateMax,
    dateLocale: input.dateLocale,
    durationLabel: `${t(I18N_KEYS.training.durationLabel)} (${t(I18N_KEYS.training.durationUnit)})`,
    durationValue: input.form.duration,
    durationHint: durationHint(t, input.selectedType),
    quantityLabel: quantityLabel(t, input.selectedType),
    quantityValue: input.form.quantity,
    showsQuantity: input.selectedType !== null && input.selectedType.unit !== null,
    notesLabel: t(I18N_KEYS.training.notesLabel),
    notesPlaceholder: t(I18N_KEYS.training.notesPlaceholder),
    notesValue: input.form.notes,
    candidateHeading: t(I18N_KEYS.training.candidateHeading),
    candidateLabel: buildCandidateLabel(t, input.selectedType),
    candidateHint: t(I18N_KEYS.training.candidatePendingHint),
    candidateNotice: t(I18N_KEYS.training.candidateNotice),
    hasCandidate: hasCandidateValue(input.selectedType),
    evidence: input.evidence,
    buddies: input.buddies,
    saveLabel: input.isSaving ? t(I18N_KEYS.training.savingDraft) : t(I18N_KEYS.training.saveDraft),
    isSaving: input.isSaving,
    canSave: input.validationKey === null && !input.isSaving,
    validationMessage: input.validationKey === null ? null : t(input.validationKey),
    ...callbacks,
  };
}
