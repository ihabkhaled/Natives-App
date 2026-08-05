import { translateFieldError, type FormFieldBinding } from '@/packages/forms';
import { I18N_KEYS } from '@/shared/i18n';

import {
  SCHEDULE_FREQUENCY_LABEL_KEYS,
  SCHEDULE_FREQUENCY_OPTIONS,
  SCHEDULE_STATUS_LABEL_KEYS,
  SCHEDULE_VISIBILITY_LABEL_KEYS,
  SCHEDULE_VISIBILITY_OPTIONS,
} from '../constants/practice-schedules.constants';
import type { PracticeSchedule } from '../types/practice-schedules.types';
import type {
  LabeledOption,
  PracticeScheduleDetailScreenView,
  ScheduleActionMessageView,
  ScheduleFormFieldsView,
} from '../types/practice-schedules-view.types';
import { buildWeekdayOptions } from './schedule-form.helper';

const KEYS = I18N_KEYS.practiceSchedules;

/** Translate with optional interpolation, as the i18n package exposes it. */
type Translate = (key: string, params?: Readonly<Record<string, number>>) => string;

/** The twelve string-bound fields `useScheduleForm` exposes, before translation. */
export interface ScheduleFormBindings {
  readonly nameField: FormFieldBinding;
  readonly sessionTypeField: FormFieldBinding;
  readonly frequencyField: FormFieldBinding;
  readonly intervalWeeksField: FormFieldBinding;
  readonly startTimeField: FormFieldBinding;
  readonly durationField: FormFieldBinding;
  readonly timezoneField: FormFieldBinding;
  readonly generationStartField: FormFieldBinding;
  readonly generationUntilField: FormFieldBinding;
  readonly visibilityField: FormFieldBinding;
  readonly capacityField: FormFieldBinding;
  readonly notesField: FormFieldBinding;
  readonly onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  readonly onReset: () => void;
}

/** Everything the detail screen needs that is not copy. */
export interface ScheduleDetailViewInput {
  readonly schedule: PracticeSchedule | undefined;
  readonly isLoading: boolean;
  readonly isForbidden: boolean;
  readonly hasError: boolean;
  readonly isCreateMode: boolean;
  readonly onBack: () => void;
  readonly formBindings: ScheduleFormBindings;
  readonly weekdays: readonly number[];
  readonly onWeekdayToggle: (day: number) => void;
  readonly isSaving: boolean;
  readonly isDeleting: boolean;
  readonly canDelete: boolean;
  readonly onDelete: () => void;
  readonly isGenerating: boolean;
  readonly canGenerate: boolean;
  readonly onGenerate: () => void;
  readonly messages: readonly ScheduleActionMessageView[];
}

function labelOptions(
  t: Translate,
  values: readonly string[],
  labelKeys: Record<string, string>,
): readonly LabeledOption[] {
  return values.map((value) => ({ value, label: t(labelKeys[value] ?? '') }));
}

/** "Create"/"Creating" for a new pattern, "Save"/"Saving" for an existing one. */
function saveLabelKey(isCreateMode: boolean, isSaving: boolean): string {
  if (isCreateMode) {
    return isSaving ? KEYS.creatingLabel : KEYS.createLabel;
  }
  return isSaving ? KEYS.savingLabel : KEYS.saveLabel;
}

/** Static copy — the strings that never depend on server state. */
function buildChrome(
  t: Translate,
  isCreateMode: boolean,
): Pick<
  PracticeScheduleDetailScreenView,
  'title' | 'loadingLabel' | 'errorTitle' | 'errorMessage' | 'backLabel' | 'deleteLabel' | 'generateLabel'
> {
  return {
    title: t(isCreateMode ? KEYS.createTitle : KEYS.detailTitle),
    loadingLabel: t(KEYS.loadingLabel),
    errorTitle: t(KEYS.errorTitle),
    errorMessage: t(KEYS.errorMessage),
    backLabel: t(KEYS.backLabel),
    deleteLabel: t(KEYS.deleteLabel),
    generateLabel: t(KEYS.generateLabel),
  };
}

/** Every field binding, its label, and the select/weekday option lists. */
function buildFormFieldsView(
  t: Translate,
  input: ScheduleDetailViewInput,
): ScheduleFormFieldsView {
  const { formBindings: fields } = input;
  return {
    nameField: translateFieldError(fields.nameField, t),
    nameLabel: t(KEYS.nameLabel),
    sessionTypeField: translateFieldError(fields.sessionTypeField, t),
    sessionTypeLabel: t(KEYS.sessionTypeLabel),
    frequencyLabel: t(KEYS.frequencyLabel),
    frequencyValue: fields.frequencyField.value,
    frequencyOptions: labelOptions(t, SCHEDULE_FREQUENCY_OPTIONS, SCHEDULE_FREQUENCY_LABEL_KEYS),
    onFrequencyChange: fields.frequencyField.onChange,
    weekdaysLabel: t(KEYS.weekdaysLabel),
    weekdayOptions: buildWeekdayOptions(t, input.weekdays),
    onWeekdayToggle: input.onWeekdayToggle,
    intervalWeeksField: translateFieldError(fields.intervalWeeksField, t),
    intervalWeeksLabel: t(KEYS.intervalWeeksLabel),
    startTimeField: translateFieldError(fields.startTimeField, t),
    startTimeLabel: t(KEYS.startTimeLabel),
    durationField: translateFieldError(fields.durationField, t),
    durationLabel: t(KEYS.durationLabel),
    timezoneField: translateFieldError(fields.timezoneField, t),
    timezoneLabel: t(KEYS.timezoneLabel),
    generationStartField: translateFieldError(fields.generationStartField, t),
    generationStartLabel: t(KEYS.generationStartLabel),
    generationUntilField: translateFieldError(fields.generationUntilField, t),
    generationUntilLabel: t(KEYS.generationUntilLabel),
    visibilityLabel: t(KEYS.visibilityLabel),
    visibilityValue: fields.visibilityField.value,
    visibilityOptions: labelOptions(t, SCHEDULE_VISIBILITY_OPTIONS, SCHEDULE_VISIBILITY_LABEL_KEYS),
    onVisibilityChange: fields.visibilityField.onChange,
    capacityField: translateFieldError(fields.capacityField, t),
    capacityLabel: t(KEYS.capacityLabel),
    notesField: translateFieldError(fields.notesField, t),
    notesLabel: t(KEYS.notesLabel),
    onSubmit: fields.onSubmit,
    onReset: fields.onReset,
    saveLabel: t(saveLabelKey(input.isCreateMode, input.isSaving)),
    isSaving: input.isSaving,
  };
}

/** Delete and generate are both destructive-adjacent, so both stay off in create mode. */
function buildActions(
  input: ScheduleDetailViewInput,
): Pick<PracticeScheduleDetailScreenView, 'isDeleting' | 'canDelete' | 'onDelete' | 'isGenerating' | 'canGenerate' | 'onGenerate'> {
  const recordExists = !input.isCreateMode;
  return {
    isDeleting: input.isDeleting,
    canDelete: recordExists && input.canDelete && !input.isDeleting,
    onDelete: input.onDelete,
    isGenerating: input.isGenerating,
    canGenerate: recordExists && input.canGenerate && !input.isGenerating,
    onGenerate: input.onGenerate,
  };
}

/**
 * Assemble the whole detail view from three focused builders.
 *
 * Extracted from the screen hook so the hook only wires the query, the form,
 * and the mutations, and every piece of copy resolution is testable without
 * rendering.
 */
export function buildScheduleDetailView(
  t: Translate,
  input: ScheduleDetailViewInput,
): PracticeScheduleDetailScreenView {
  return {
    ...buildChrome(t, input.isCreateMode),
    heading: input.schedule?.name ?? t(KEYS.createTitle),
    isLoading: input.isLoading,
    isForbidden: input.isForbidden,
    hasError: input.hasError,
    isCreateMode: input.isCreateMode,
    onBack: input.onBack,
    statusLabel:
      input.schedule === undefined ? '' : t(SCHEDULE_STATUS_LABEL_KEYS[input.schedule.status]),
    form: buildFormFieldsView(t, input),
    ...buildActions(input),
    messages: input.messages,
  };
}
