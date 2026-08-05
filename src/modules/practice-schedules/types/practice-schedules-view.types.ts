import type { FormFieldBinding } from '@/packages/forms';

/** One row in the schedule list. */
export interface ScheduleRowView {
  readonly id: string;
  readonly name: string;
  /** e.g. "Weekly · Mon, Wed, Fri · 18:00" — assembled once, not re-derived per render. */
  readonly summary: string;
  readonly statusLabel: string;
  readonly isArchived: boolean;
  readonly detailPath: string;
}

export interface PracticeSchedulesListScreenView {
  readonly title: string;
  readonly subtitle: string;
  readonly isLoading: boolean;
  readonly loadingLabel: string;
  readonly isForbidden: boolean;
  readonly hasError: boolean;
  readonly errorTitle: string;
  readonly errorMessage: string;
  readonly newLabel: string;
  readonly onNew: () => void;
  readonly countLabel: string;
  readonly hasSchedules: boolean;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
  readonly rows: readonly ScheduleRowView[];
  readonly onOpen: (scheduleId: string) => void;
}

/** One weekday toggle: its wire value, translated label, and current state. */
export interface WeekdayOptionView {
  readonly value: number;
  readonly label: string;
  readonly selected: boolean;
}

/** A plain string value plus its translated label — the shape every select shares. */
export interface LabeledOption {
  readonly value: string;
  readonly label: string;
}

/** Every field binding and piece of copy the schedule form renders. */
export interface ScheduleFormFieldsView {
  readonly nameField: FormFieldBinding;
  readonly nameLabel: string;
  readonly sessionTypeField: FormFieldBinding;
  readonly sessionTypeLabel: string;
  readonly frequencyLabel: string;
  readonly frequencyValue: string;
  readonly frequencyOptions: readonly LabeledOption[];
  readonly onFrequencyChange: (value: string) => void;
  readonly weekdaysLabel: string;
  readonly weekdayOptions: readonly WeekdayOptionView[];
  readonly onWeekdayToggle: (day: number) => void;
  readonly intervalWeeksField: FormFieldBinding;
  readonly intervalWeeksLabel: string;
  readonly startTimeField: FormFieldBinding;
  readonly startTimeLabel: string;
  readonly durationField: FormFieldBinding;
  readonly durationLabel: string;
  readonly timezoneField: FormFieldBinding;
  readonly timezoneLabel: string;
  readonly generationStartField: FormFieldBinding;
  readonly generationStartLabel: string;
  readonly generationUntilField: FormFieldBinding;
  readonly generationUntilLabel: string;
  readonly visibilityLabel: string;
  readonly visibilityValue: string;
  readonly visibilityOptions: readonly LabeledOption[];
  readonly onVisibilityChange: (value: string) => void;
  readonly capacityField: FormFieldBinding;
  readonly capacityLabel: string;
  readonly notesField: FormFieldBinding;
  readonly notesLabel: string;
  readonly onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  readonly onReset: () => void;
  readonly saveLabel: string;
  readonly isSaving: boolean;
}

/** One finished-action message, already translated. */
export interface ScheduleActionMessageView {
  readonly id: string;
  readonly text: string;
}

export interface PracticeScheduleDetailScreenView {
  readonly title: string;
  readonly heading: string;
  readonly isLoading: boolean;
  readonly loadingLabel: string;
  readonly isForbidden: boolean;
  readonly hasError: boolean;
  readonly errorTitle: string;
  readonly errorMessage: string;
  /** No `:scheduleId` route param resolved — the form starts blank. */
  readonly isCreateMode: boolean;
  readonly backLabel: string;
  readonly onBack: () => void;
  /** Empty in create mode; there is no status until the record exists. */
  readonly statusLabel: string;
  readonly form: ScheduleFormFieldsView;
  readonly deleteLabel: string;
  readonly isDeleting: boolean;
  readonly canDelete: boolean;
  readonly onDelete: () => void;
  readonly generateLabel: string;
  readonly isGenerating: boolean;
  readonly canGenerate: boolean;
  readonly onGenerate: () => void;
  readonly messages: readonly ScheduleActionMessageView[];
}

/** The schedule form's own values; every field is a string, per `FormFieldBinding`. */
export interface ScheduleFormValues {
  readonly name: string;
  readonly sessionType: string;
  readonly frequency: string;
  readonly intervalWeeks: string;
  readonly startTimeLocal: string;
  readonly durationMinutes: string;
  readonly timezone: string;
  readonly generationStart: string;
  readonly generationUntil: string;
  readonly visibility: string;
  readonly defaultCapacity: string;
  readonly notes: string;
}
