import { describe, expect, it, vi } from 'vitest';

import type { PracticeSchedule } from '../types/practice-schedules.types';
import {
  buildScheduleDetailView,
  type ScheduleDetailViewInput,
  type ScheduleFormBindings,
} from './schedule-detail-view.helper';

const t = (key: string): string => key;

function field(): { name: string; value: string; onChange: () => void; onBlur: () => void; errorMessage: string | undefined } {
  return { name: 'f', value: '', onChange: vi.fn(), onBlur: vi.fn(), errorMessage: undefined };
}

const FORM_BINDINGS: ScheduleFormBindings = {
  nameField: field(),
  sessionTypeField: field(),
  frequencyField: { ...field(), value: 'weekly' },
  intervalWeeksField: field(),
  startTimeField: field(),
  durationField: field(),
  timezoneField: field(),
  generationStartField: field(),
  generationUntilField: field(),
  visibilityField: { ...field(), value: 'team' },
  capacityField: field(),
  notesField: field(),
  onSubmit: vi.fn(),
  onReset: vi.fn(),
};

const SCHEDULE: PracticeSchedule = {
  id: 's1',
  teamId: 't1',
  seasonId: null,
  name: 'Evening practice',
  sessionType: 'practice',
  timezone: 'Africa/Cairo',
  frequency: 'weekly',
  intervalWeeks: 1,
  weekdays: [1],
  startTimeLocal: '18:00',
  durationMinutes: 90,
  meetOffsetMinutes: null,
  rsvpCutoffMinutes: null,
  defaultVenueId: null,
  defaultField: null,
  defaultCapacity: null,
  visibility: 'team',
  organizerUserId: null,
  notes: null,
  generationStart: '2026-01-01',
  generationUntil: '2026-03-01',
  exceptions: [],
  status: 'active',
  createdAtIso: '2026-01-01T00:00:00.000Z',
  updatedAtIso: '2026-01-01T00:00:00.000Z',
  version: 1,
};

function baseInput(overrides: Partial<ScheduleDetailViewInput> = {}): ScheduleDetailViewInput {
  return {
    schedule: undefined,
    isLoading: false,
    isForbidden: false,
    hasError: false,
    isCreateMode: false,
    onBack: vi.fn(),
    formBindings: FORM_BINDINGS,
    weekdays: [1],
    onWeekdayToggle: vi.fn(),
    isSaving: false,
    isDeleting: false,
    canDelete: false,
    onDelete: vi.fn(),
    isGenerating: false,
    canGenerate: false,
    onGenerate: vi.fn(),
    messages: [],
    ...overrides,
  };
}

describe('buildScheduleDetailView', () => {
  it('titles the screen and the save button for an existing record', () => {
    const view = buildScheduleDetailView(t, baseInput({ schedule: SCHEDULE }));

    expect(view.title).toBe('practiceSchedules.detailTitle');
    expect(view.heading).toBe('Evening practice');
    expect(view.form.saveLabel).toBe('practiceSchedules.saveLabel');
    expect(view.statusLabel).toBe('practiceSchedules.statusActive');
  });

  it('titles the screen and the save button for a fresh draft', () => {
    const view = buildScheduleDetailView(t, baseInput({ isCreateMode: true, schedule: undefined }));

    expect(view.title).toBe('practiceSchedules.createTitle');
    expect(view.heading).toBe('practiceSchedules.createTitle');
    expect(view.form.saveLabel).toBe('practiceSchedules.createLabel');
    expect(view.statusLabel).toBe('');
  });

  it('swaps the save label to its running form while saving', () => {
    const editing = buildScheduleDetailView(t, baseInput({ schedule: SCHEDULE, isSaving: true }));
    const creating = buildScheduleDetailView(
      t,
      baseInput({ isCreateMode: true, isSaving: true }),
    );

    expect(editing.form.saveLabel).toBe('practiceSchedules.savingLabel');
    expect(creating.form.saveLabel).toBe('practiceSchedules.creatingLabel');
  });

  it('keeps delete and generate off in create mode regardless of the flags passed in', () => {
    const view = buildScheduleDetailView(
      t,
      baseInput({ isCreateMode: true, canDelete: true, canGenerate: true }),
    );

    expect(view.canDelete).toBe(false);
    expect(view.canGenerate).toBe(false);
  });

  it('allows delete and generate on an existing record when the caller says so', () => {
    const view = buildScheduleDetailView(
      t,
      baseInput({ schedule: SCHEDULE, canDelete: true, canGenerate: true }),
    );

    expect(view.canDelete).toBe(true);
    expect(view.canGenerate).toBe(true);
  });

  it('turns off an action while it is itself running', () => {
    const view = buildScheduleDetailView(
      t,
      baseInput({
        schedule: SCHEDULE,
        canDelete: true,
        isDeleting: true,
        canGenerate: true,
        isGenerating: true,
      }),
    );

    expect(view.canDelete).toBe(false);
    expect(view.canGenerate).toBe(false);
  });

  it('builds the weekday and select options from the constant catalogues', () => {
    const view = buildScheduleDetailView(t, baseInput({ schedule: SCHEDULE }));

    expect(view.form.frequencyOptions).toEqual([
      { value: 'weekly', label: 'practiceSchedules.frequencyWeekly' },
      { value: 'one_off', label: 'practiceSchedules.frequencyOneOff' },
    ]);
    expect(view.form.weekdayOptions).toHaveLength(7);
    expect(view.form.visibilityOptions).toHaveLength(3);
  });

  it('passes loading, forbidden, error, and the message list straight through', () => {
    const view = buildScheduleDetailView(
      t,
      baseInput({
        isLoading: true,
        isForbidden: true,
        hasError: true,
        messages: [{ id: 'm1', text: 'Saved.' }],
      }),
    );

    expect(view.isLoading).toBe(true);
    expect(view.isForbidden).toBe(true);
    expect(view.hasError).toBe(true);
    expect(view.messages).toEqual([{ id: 'm1', text: 'Saved.' }]);
  });
});
