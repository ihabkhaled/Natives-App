import type { TranslateParams } from '@/packages/i18n';
import { translateFieldError, type FormFieldBinding } from '@/packages/forms';
import { I18N_KEYS } from '@/shared/i18n';

import { DRILL_CATEGORIES, DRILL_INTENSITIES } from '../constants/drills.constants';
import {
  DRILL_CATEGORY_LABEL_KEYS,
  DRILL_INTENSITY_LABEL_KEYS,
} from '../constants/drills-labels.constants';
import type {
  DrillFormFieldView,
  DrillFormSelectView,
  DrillFormView,
} from '../types/drills-view.types';
import { buildDrillVocabularyOptions } from './drills-filter.helper';

type Translate = (key: string, params?: TranslateParams) => string;

const KEYS = I18N_KEYS.drills;

/** Every field binding the form hook produces, before it is translated and labelled. */
export interface DrillFormFieldsInput {
  readonly nameField: FormFieldBinding;
  readonly categoryField: FormFieldBinding;
  readonly intensityField: FormFieldBinding;
  readonly objectiveField: FormFieldBinding;
  readonly instructionsField: FormFieldBinding;
  readonly equipmentField: FormFieldBinding;
  readonly skillTagsField: FormFieldBinding;
  readonly durationField: FormFieldBinding;
  readonly safetyNotesField: FormFieldBinding;
  readonly mediaUrlField: FormFieldBinding;
  readonly isSubmitting: boolean;
  readonly onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  readonly onCancel: () => void;
  readonly heading: string;
}

interface TextFieldSpec {
  readonly binding: FormFieldBinding;
  readonly labelKey: string;
  readonly placeholderKey: string;
}

function buildTextField(t: Translate, spec: TextFieldSpec): DrillFormFieldView {
  const translated = translateFieldError(spec.binding, t);
  return {
    label: t(spec.labelKey),
    name: translated.name,
    value: translated.value,
    placeholder: t(spec.placeholderKey),
    errorMessage: translated.errorMessage,
    onChange: translated.onChange,
    onBlur: translated.onBlur,
  };
}

interface SelectFieldSpec {
  readonly binding: FormFieldBinding;
  readonly labelKey: string;
  readonly values: readonly string[];
  readonly labelKeys: Readonly<Record<string, string>>;
}

function buildSelectField(t: Translate, spec: SelectFieldSpec): DrillFormSelectView {
  return {
    label: t(spec.labelKey),
    value: spec.binding.value,
    options: buildDrillVocabularyOptions(t, spec.values, spec.labelKeys),
    onChange: spec.binding.onChange,
  };
}

/** The first half of the free-text fields. */
function buildPrimaryTextFields(
  t: Translate,
  input: DrillFormFieldsInput,
): Pick<DrillFormView, 'nameField' | 'objectiveField' | 'instructionsField' | 'equipmentField'> {
  return {
    nameField: buildTextField(t, {
      binding: input.nameField,
      labelKey: KEYS.nameLabel,
      placeholderKey: KEYS.namePlaceholder,
    }),
    objectiveField: buildTextField(t, {
      binding: input.objectiveField,
      labelKey: KEYS.objectiveLabel,
      placeholderKey: KEYS.objectivePlaceholder,
    }),
    instructionsField: buildTextField(t, {
      binding: input.instructionsField,
      labelKey: KEYS.instructionsLabel,
      placeholderKey: KEYS.instructionsPlaceholder,
    }),
    equipmentField: buildTextField(t, {
      binding: input.equipmentField,
      labelKey: KEYS.equipmentLabel,
      placeholderKey: KEYS.equipmentPlaceholder,
    }),
  };
}

/** The remaining free-text/numeric fields. */
function buildSecondaryTextFields(
  t: Translate,
  input: DrillFormFieldsInput,
): Pick<DrillFormView, 'skillTagsField' | 'durationField' | 'safetyNotesField' | 'mediaUrlField'> {
  return {
    skillTagsField: buildTextField(t, {
      binding: input.skillTagsField,
      labelKey: KEYS.skillTagsLabel,
      placeholderKey: KEYS.skillTagsPlaceholder,
    }),
    durationField: buildTextField(t, {
      binding: input.durationField,
      labelKey: KEYS.durationInputLabel,
      placeholderKey: KEYS.durationPlaceholder,
    }),
    safetyNotesField: buildTextField(t, {
      binding: input.safetyNotesField,
      labelKey: KEYS.safetyNotesLabel,
      placeholderKey: KEYS.safetyNotesPlaceholder,
    }),
    mediaUrlField: buildTextField(t, {
      binding: input.mediaUrlField,
      labelKey: KEYS.mediaUrlLabel,
      placeholderKey: KEYS.mediaUrlPlaceholder,
    }),
  };
}

/** The two vocabulary-backed selects. */
function buildSelectFields(
  t: Translate,
  input: DrillFormFieldsInput,
): Pick<DrillFormView, 'categoryField' | 'intensityField'> {
  return {
    categoryField: buildSelectField(t, {
      binding: input.categoryField,
      labelKey: KEYS.categoryLabel,
      values: DRILL_CATEGORIES,
      labelKeys: DRILL_CATEGORY_LABEL_KEYS,
    }),
    intensityField: buildSelectField(t, {
      binding: input.intensityField,
      labelKey: KEYS.intensityLabel,
      values: DRILL_INTENSITIES,
      labelKeys: DRILL_INTENSITY_LABEL_KEYS,
    }),
  };
}

/** Assemble the whole form view from its ten field bindings and controls. */
export function buildDrillFormView(t: Translate, input: DrillFormFieldsInput): DrillFormView {
  return {
    heading: input.heading,
    ...buildPrimaryTextFields(t, input),
    ...buildSecondaryTextFields(t, input),
    ...buildSelectFields(t, input),
    saveLabel: input.isSubmitting ? t(KEYS.savingLabel) : t(KEYS.saveLabel),
    isSubmitting: input.isSubmitting,
    onSubmit: input.onSubmit,
    cancelLabel: t(KEYS.cancelLabel),
    onCancel: input.onCancel,
  };
}
