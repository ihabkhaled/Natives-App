import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EMPTY_SCHEDULE_FORM_VALUES } from '../helpers/schedule-form.helper';
import type { ScheduleFormValues } from '../types/practice-schedules-view.types';
import { useScheduleForm } from './use-schedule-form.hook';

const LOADED: ScheduleFormValues = {
  name: 'Evening practice',
  sessionType: 'practice',
  frequency: 'weekly',
  intervalWeeks: '1',
  startTimeLocal: '18:00',
  durationMinutes: '90',
  timezone: 'Africa/Cairo',
  generationStart: '2026-01-01',
  generationUntil: '2026-03-01',
  visibility: 'team',
  defaultCapacity: '24',
  notes: '',
};

function renderForm(values: ScheduleFormValues, onValidSubmit = vi.fn()) {
  return renderHook(
    (props: { readonly values: ScheduleFormValues }) =>
      useScheduleForm({ values: props.values, onValidSubmit }),
    { initialProps: { values } },
  );
}

function submit(form: ReturnType<typeof useScheduleForm>): void {
  form.onSubmit({ preventDefault: () => undefined } as React.SyntheticEvent<HTMLFormElement>);
}

describe('useScheduleForm', () => {
  it('binds one field per editable column', () => {
    const { result } = renderForm(EMPTY_SCHEDULE_FORM_VALUES);

    expect([
      result.current.nameField.name,
      result.current.sessionTypeField.name,
      result.current.frequencyField.name,
      result.current.intervalWeeksField.name,
      result.current.startTimeField.name,
      result.current.durationField.name,
      result.current.timezoneField.name,
      result.current.generationStartField.name,
      result.current.generationUntilField.name,
      result.current.visibilityField.name,
      result.current.capacityField.name,
      result.current.notesField.name,
    ]).toEqual([
      'name',
      'sessionType',
      'frequency',
      'intervalWeeks',
      'startTimeLocal',
      'durationMinutes',
      'timezone',
      'generationStart',
      'generationUntil',
      'visibility',
      'defaultCapacity',
      'notes',
    ]);
  });

  it('loads a schedule into the fields', async () => {
    const { result } = renderForm(LOADED);

    await waitFor(() => {
      expect(result.current.nameField.value).toBe('Evening practice');
    });
    expect(result.current.startTimeField.value).toBe('18:00');
  });

  it('reloads the fields when the edited schedule changes', async () => {
    const { result, rerender } = renderForm(EMPTY_SCHEDULE_FORM_VALUES);
    rerender({ values: LOADED });

    await waitFor(() => {
      expect(result.current.nameField.value).toBe('Evening practice');
    });
  });

  it('reports a schema failure as an untranslated key on the field', async () => {
    const onValidSubmit = vi.fn();
    const { result } = renderForm(EMPTY_SCHEDULE_FORM_VALUES, onValidSubmit);
    act(() => {
      submit(result.current);
    });

    await waitFor(() => {
      expect(result.current.nameField.errorMessage).toBe('practiceSchedules.validationNameRequired');
    });
    expect(onValidSubmit).not.toHaveBeenCalled();
  });

  it('hands a valid schedule to the caller', async () => {
    const onValidSubmit = vi.fn();
    const { result } = renderForm(LOADED, onValidSubmit);
    await waitFor(() => {
      expect(result.current.nameField.value).toBe('Evening practice');
    });
    act(() => {
      submit(result.current);
    });

    await waitFor(() => {
      expect(onValidSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Evening practice' }),
      );
    });
  });

  it('discards edits back to the loaded schedule on cancel', async () => {
    const { result } = renderForm(LOADED);
    await waitFor(() => {
      expect(result.current.nameField.value).toBe('Evening practice');
    });
    act(() => {
      result.current.nameField.onChange('Scrapped name');
    });
    await waitFor(() => {
      expect(result.current.nameField.value).toBe('Scrapped name');
    });
    act(() => {
      result.current.onReset();
    });

    await waitFor(() => {
      expect(result.current.nameField.value).toBe('Evening practice');
    });
  });
});
