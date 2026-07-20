import { useState } from 'react';

import { cairoDayKey, nowIso } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';

import {
  EMPTY_COMPOSER_STATE,
  EMPTY_EVIDENCE_FORM,
  type ComposerFormState,
  type EvidenceFormState,
} from '../constants/training-form.constants';
import type { EvidenceKind } from '../constants/training.constants';
import { findActivityType } from '../helpers/collection.helper';
import {
  buildBuddyEditorView,
  buildEvidenceEditorView,
  evidenceRowKey,
} from '../helpers/composer-editor.helper';
import { appendBuddy, appendEvidence } from '../helpers/composer-state.helper';
import { buildComposerView } from '../helpers/composer-view.helper';
import { toSubmissionDraft, validateComposer } from '../helpers/submission-draft.helper';
import type { TrainingComposerView, TrainingOption } from '../types/training-view.types';
import type { ActivityType, SubmissionDraft } from '../types/training.types';

export interface ComposerInput {
  readonly activityTypes: readonly ActivityType[];
  readonly buddyOptions: readonly TrainingOption[];
  readonly isSaving: boolean;
  readonly onSave: (draft: SubmissionDraft) => void;
}

/**
 * Composer behaviour: form state, the honest candidate-points readout, the
 * evidence metadata rows, the buddy list, and the single validated save. No
 * points arithmetic happens here — the backend awards, the client only shows
 * the catalog's candidate value.
 */
export function useTrainingComposer(input: ComposerInput): TrainingComposerView {
  const { t } = useAppTranslation();
  const [form, setForm] = useState<ComposerFormState>(EMPTY_COMPOSER_STATE);
  const [evidenceForm, setEvidenceForm] = useState<EvidenceFormState>(EMPTY_EVIDENCE_FORM);
  const [buddyValue, setBuddyValue] = useState('');

  const selectedType = findActivityType(input.activityTypes, form.activityTypeId);
  const validationKey = validateComposer(form, selectedType, cairoDayKey(nowIso()));

  function patch(changes: Partial<ComposerFormState>): void {
    setForm((current) => ({ ...current, ...changes }));
  }

  const evidence = buildEvidenceEditorView(t, form, evidenceForm, {
    onKindChange: (value) => {
      setEvidenceForm((current) => ({ ...current, kind: value as EvidenceKind }));
    },
    onReferenceChange: (value) => {
      setEvidenceForm((current) => ({ ...current, reference: value }));
    },
    onDescriptionChange: (value) => {
      setEvidenceForm((current) => ({ ...current, description: value }));
    },
    onAdd: () => {
      setForm((current) => appendEvidence(current, evidenceForm));
      setEvidenceForm(EMPTY_EVIDENCE_FORM);
    },
    onRemove: (key) => {
      patch({
        evidence: form.evidence.filter((item, index) => evidenceRowKey(item.kind, index) !== key),
      });
    },
  });

  const buddies = buildBuddyEditorView(t, form, input.buddyOptions, {
    value: buddyValue,
    callbacks: {
      onValueChange: setBuddyValue,
      onAdd: () => {
        setForm((current) => appendBuddy(current, buddyValue));
        setBuddyValue('');
      },
      onRemove: (membershipId) => {
        patch({
          buddyMembershipIds: form.buddyMembershipIds.filter((value) => value !== membershipId),
        });
      },
    },
  });

  return buildComposerView(
    t,
    {
      form,
      activityTypes: input.activityTypes,
      selectedType,
      validationKey,
      isSaving: input.isSaving,
      evidence,
      buddies,
    },
    {
      onTypeChange: (value) => {
        patch({ activityTypeId: value });
      },
      onDateChange: (value) => {
        patch({ performedOn: value });
      },
      onDurationChange: (value) => {
        patch({ duration: value });
      },
      onQuantityChange: (value) => {
        patch({ quantity: value });
      },
      onNotesChange: (value) => {
        patch({ notes: value });
      },
      onSave: () => {
        if (validationKey === null) {
          input.onSave(toSubmissionDraft(form));
          setForm(EMPTY_COMPOSER_STATE);
        }
      },
    },
  );
}
