import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type { ComposerFormState, EvidenceFormState } from '../constants/training-form.constants';
import {
  EVIDENCE_KIND_LABEL_KEYS,
  EVIDENCE_KINDS,
  type EvidenceKind,
} from '../constants/training.constants';
import type {
  TrainingBuddyEditorView,
  TrainingEvidenceEditorView,
  TrainingOption,
} from '../types/training-view.types';
import { validateEvidenceDraft } from './submission-draft.helper';

type Translate = (key: string, params?: TranslateParams) => string;

/** Stable identity for an unsaved evidence row (index-derived, not an id). */
export function evidenceRowKey(kind: EvidenceKind, index: number): string {
  return `${kind}-${String(index)}`;
}

export interface EvidenceEditorCallbacks {
  readonly onKindChange: (value: string) => void;
  readonly onReferenceChange: (value: string) => void;
  readonly onDescriptionChange: (value: string) => void;
  readonly onAdd: () => void;
  readonly onRemove: (key: string) => void;
}

/** Translate the evidence sub-form's state into its presentational view. */
export function buildEvidenceEditorView(
  t: Translate,
  form: ComposerFormState,
  evidenceForm: EvidenceFormState,
  callbacks: EvidenceEditorCallbacks,
): TrainingEvidenceEditorView {
  return {
    heading: t(I18N_KEYS.training.evidenceHeading),
    intro: t(I18N_KEYS.training.evidenceIntro),
    privacyNotice: t(I18N_KEYS.training.evidencePrivacyNotice),
    kindLabel: t(I18N_KEYS.training.evidenceKindLabel),
    kindValue: evidenceForm.kind,
    kindOptions: EVIDENCE_KINDS.map((kind) => ({
      value: kind,
      label: t(EVIDENCE_KIND_LABEL_KEYS[kind]),
    })),
    referenceLabel: t(I18N_KEYS.training.evidenceReferenceLabel),
    referenceValue: evidenceForm.reference,
    descriptionLabel: t(I18N_KEYS.training.evidenceDescriptionLabel),
    descriptionValue: evidenceForm.description,
    addLabel: t(I18N_KEYS.training.evidenceAdd),
    removeLabel: t(I18N_KEYS.training.evidenceRemove),
    emptyLabel: t(I18N_KEYS.training.evidenceEmpty),
    items: form.evidence.map((item, index) => ({
      key: evidenceRowKey(item.kind, index),
      kindLabel: t(EVIDENCE_KIND_LABEL_KEYS[item.kind]),
      reference: item.storageReference,
      description: item.description,
    })),
    canAdd: validateEvidenceDraft(evidenceForm.reference) === null,
    ...callbacks,
  };
}

export interface BuddyEditorCallbacks {
  readonly onValueChange: (value: string) => void;
  readonly onAdd: () => void;
  readonly onRemove: (membershipId: string) => void;
}

/**
 * Translate the buddy picker's state into its presentational view. Naming a
 * buddy is an invitation only — the confirmed/declined answer is theirs.
 */
export function buildBuddyEditorView(
  t: Translate,
  form: ComposerFormState,
  options: readonly TrainingOption[],
  selection: { readonly value: string; readonly callbacks: BuddyEditorCallbacks },
): TrainingBuddyEditorView {
  const chosen = form.buddyMembershipIds;
  return {
    heading: t(I18N_KEYS.training.buddiesHeading),
    intro: t(I18N_KEYS.training.buddiesIntro),
    addFieldLabel: t(I18N_KEYS.training.buddyAddLabel),
    addLabel: t(I18N_KEYS.training.buddyAdd),
    removeLabel: t(I18N_KEYS.training.buddyRemove),
    emptyLabel: t(I18N_KEYS.training.buddyEmpty),
    value: selection.value,
    options: options.filter((option) => !chosen.includes(option.value)),
    selected: chosen.map((membershipId) => ({
      value: membershipId,
      label: options.find((option) => option.value === membershipId)?.label ?? membershipId,
    })),
    canAdd: selection.value !== '' && !chosen.includes(selection.value),
    ...selection.callbacks,
  };
}
