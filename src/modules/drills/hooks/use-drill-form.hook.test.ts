import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { DrillFormValues } from '../types/drills.types';
import { useDrillForm } from './use-drill-form.hook';

const EMPTY: DrillFormValues = {
  name: '',
  category: '',
  intensity: 'moderate',
  objective: '',
  instructions: '',
  equipment: '',
  skillTags: '',
  defaultDurationMinutes: '',
  safetyNotes: '',
  mediaUrl: '',
};

const LOADED: DrillFormValues = {
  name: 'Give-and-go break',
  category: 'throwing',
  intensity: 'high',
  objective: 'Build first-throw decision speed.',
  instructions: 'Pairs exchange give-and-go passes.',
  equipment: 'cones, discs',
  skillTags: 'throwing',
  defaultDurationMinutes: '15',
  safetyNotes: '',
  mediaUrl: '',
};

function renderForm(values: DrillFormValues, onValidSubmit = vi.fn()) {
  return renderHook(
    (props: { readonly values: DrillFormValues }) =>
      useDrillForm({ values: props.values, onValidSubmit }),
    { initialProps: { values } },
  );
}

function submit(form: ReturnType<typeof useDrillForm>): void {
  form.onSubmit({ preventDefault: () => undefined } as React.SyntheticEvent<HTMLFormElement>);
}

describe('useDrillForm', () => {
  it('binds one field per editable column', () => {
    const { result } = renderForm(EMPTY);

    expect([
      result.current.nameField.name,
      result.current.categoryField.name,
      result.current.intensityField.name,
      result.current.objectiveField.name,
      result.current.instructionsField.name,
      result.current.equipmentField.name,
      result.current.skillTagsField.name,
      result.current.durationField.name,
      result.current.safetyNotesField.name,
      result.current.mediaUrlField.name,
    ]).toEqual([
      'name',
      'category',
      'intensity',
      'objective',
      'instructions',
      'equipment',
      'skillTags',
      'defaultDurationMinutes',
      'safetyNotes',
      'mediaUrl',
    ]);
  });

  it('loads a drill into the fields', async () => {
    const { result } = renderForm(LOADED);

    await waitFor(() => {
      expect(result.current.nameField.value).toBe('Give-and-go break');
    });
    expect(result.current.categoryField.value).toBe('throwing');
  });

  it('reloads the fields when the edited drill changes', async () => {
    const { result, rerender } = renderForm(EMPTY);
    rerender({ values: LOADED });

    await waitFor(() => {
      expect(result.current.nameField.value).toBe('Give-and-go break');
    });
  });

  it('rejects a submit with a blank required field', async () => {
    const onValidSubmit = vi.fn();
    const { result } = renderForm(EMPTY, onValidSubmit);
    act(() => {
      submit(result.current);
    });

    await waitFor(() => {
      expect(result.current.nameField.errorMessage).toBe('drills.validationNameRequired');
    });
    expect(onValidSubmit).not.toHaveBeenCalled();
  });

  it('hands a valid drill to the caller', async () => {
    const onValidSubmit = vi.fn();
    const { result } = renderForm(LOADED, onValidSubmit);
    await waitFor(() => {
      expect(result.current.nameField.value).toBe('Give-and-go break');
    });
    act(() => {
      submit(result.current);
    });

    await waitFor(() => {
      expect(onValidSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Give-and-go break' }),
      );
    });
  });

  it('discards edits back to the loaded drill on cancel', async () => {
    const { result } = renderForm(LOADED);
    await waitFor(() => {
      expect(result.current.nameField.value).toBe('Give-and-go break');
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
      expect(result.current.nameField.value).toBe('Give-and-go break');
    });
  });
});
