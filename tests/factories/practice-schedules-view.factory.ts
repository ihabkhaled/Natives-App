import { vi } from 'vitest';

import type {
  PracticeScheduleDetailScreenView,
  PracticeSchedulesListScreenView,
} from '@/modules/practice-schedules';
import type {
  ScheduleFormFieldsView,
  ScheduleRowView,
} from '@/modules/practice-schedules/types/practice-schedules-view.types';

function buildField(value = ''): { name: string; value: string; onChange: () => void; onBlur: () => void; errorMessage: string | undefined } {
  return { name: 'field', value, onChange: vi.fn(), onBlur: vi.fn(), errorMessage: undefined };
}

/** One ready row: a weekly pattern, Tue/Thu, 18:00. */
export function buildScheduleRowView(overrides: Partial<ScheduleRowView> = {}): ScheduleRowView {
  return {
    id: 'schedule-mock-1',
    name: 'Tuesday & Thursday practice',
    summary: 'Weekly · Tue, Thu · 18:00',
    statusLabel: 'Active',
    isArchived: false,
    detailPath: '/practice-schedules/schedule-mock-1',
    ...overrides,
  };
}

/** A ready list screen: one active schedule. */
export function buildPracticeSchedulesScreenView(
  overrides: Partial<PracticeSchedulesListScreenView> = {},
): PracticeSchedulesListScreenView {
  return {
    title: 'Practice schedules',
    subtitle: 'The recurring pattern a team practises on.',
    isLoading: false,
    loadingLabel: 'Loading schedules…',
    isForbidden: false,
    hasError: false,
    errorTitle: 'Schedules unavailable',
    errorMessage: 'The schedule could not be read.',
    newLabel: 'New schedule',
    onNew: vi.fn(),
    countLabel: '1 schedules',
    hasSchedules: true,
    emptyTitle: 'No schedules yet',
    emptyMessage: 'Define a recurring pattern to start generating sessions from it.',
    rows: [buildScheduleRowView()],
    onOpen: vi.fn(),
    ...overrides,
  };
}

/** A ready form: every field bound, nothing invalid. */
export function buildScheduleFormFieldsView(
  overrides: Partial<ScheduleFormFieldsView> = {},
): ScheduleFormFieldsView {
  return {
    nameField: buildField('Tuesday & Thursday practice'),
    nameLabel: 'Name',
    sessionTypeField: buildField('practice'),
    sessionTypeLabel: 'Session type',
    frequencyLabel: 'Frequency',
    frequencyValue: 'weekly',
    frequencyOptions: [
      { value: 'weekly', label: 'Weekly' },
      { value: 'one_off', label: 'One-off' },
    ],
    onFrequencyChange: vi.fn(),
    weekdaysLabel: 'Days of the week',
    weekdayOptions: [
      { value: 0, label: 'Sun', selected: false },
      { value: 2, label: 'Tue', selected: true },
    ],
    onWeekdayToggle: vi.fn(),
    intervalWeeksField: buildField('1'),
    intervalWeeksLabel: 'Repeat every N weeks',
    startTimeField: buildField('18:00'),
    startTimeLabel: 'Start time',
    durationField: buildField('90'),
    durationLabel: 'Duration',
    timezoneField: buildField('Africa/Cairo'),
    timezoneLabel: 'Timezone',
    generationStartField: buildField('2026-01-01'),
    generationStartLabel: 'Generate from',
    generationUntilField: buildField('2026-03-01'),
    generationUntilLabel: 'Generate until',
    visibilityLabel: 'Visibility',
    visibilityValue: 'team',
    visibilityOptions: [
      { value: 'team', label: 'Team' },
      { value: 'coaches', label: 'Coaches only' },
      { value: 'public', label: 'Public' },
    ],
    onVisibilityChange: vi.fn(),
    capacityField: buildField('24'),
    capacityLabel: 'Default capacity',
    notesField: buildField(''),
    notesLabel: 'Notes',
    onSubmit: vi.fn(),
    onReset: vi.fn(),
    saveLabel: 'Save',
    isSaving: false,
    ...overrides,
  };
}

/** A ready detail screen: an existing active schedule, editable. */
export function buildPracticeScheduleDetailScreenView(
  overrides: Partial<PracticeScheduleDetailScreenView> = {},
): PracticeScheduleDetailScreenView {
  return {
    title: 'Edit schedule',
    heading: 'Tuesday & Thursday practice',
    isLoading: false,
    loadingLabel: 'Loading schedules…',
    isForbidden: false,
    hasError: false,
    errorTitle: 'Schedules unavailable',
    errorMessage: 'The schedule could not be read.',
    isCreateMode: false,
    backLabel: 'Back to schedules',
    onBack: vi.fn(),
    statusLabel: 'Active',
    form: buildScheduleFormFieldsView(),
    deleteLabel: 'Delete schedule',
    isDeleting: false,
    canDelete: true,
    onDelete: vi.fn(),
    generateLabel: 'Generate sessions',
    isGenerating: false,
    canGenerate: true,
    onGenerate: vi.fn(),
    messages: [],
    ...overrides,
  };
}
