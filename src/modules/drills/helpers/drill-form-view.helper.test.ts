import { describe, expect, it, vi } from 'vitest';

import type { FormFieldBinding } from '@/packages/forms';

import { buildDrillFormView, type DrillFormFieldsInput } from './drill-form-view.helper';

const t = vi.fn((key: string) => key);

function binding(name: string, overrides: Partial<FormFieldBinding> = {}): FormFieldBinding {
  return {
    name,
    value: '',
    onChange: vi.fn(),
    onBlur: vi.fn(),
    errorMessage: undefined,
    ...overrides,
  };
}

function buildInput(overrides: Partial<DrillFormFieldsInput> = {}): DrillFormFieldsInput {
  return {
    nameField: binding('name'),
    categoryField: binding('category', { value: 'throwing' }),
    intensityField: binding('intensity', { value: 'moderate' }),
    objectiveField: binding('objective'),
    instructionsField: binding('instructions'),
    equipmentField: binding('equipment'),
    skillTagsField: binding('skillTags'),
    durationField: binding('defaultDurationMinutes'),
    safetyNotesField: binding('safetyNotes'),
    mediaUrlField: binding('mediaUrl'),
    isSubmitting: false,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    heading: 'Drill details',
    ...overrides,
  };
}

describe('buildDrillFormView', () => {
  it('binds every one of the ten fields', () => {
    const view = buildDrillFormView(t, buildInput());

    expect(view.nameField.name).toBe('name');
    expect(view.objectiveField.name).toBe('objective');
    expect(view.instructionsField.name).toBe('instructions');
    expect(view.equipmentField.name).toBe('equipment');
    expect(view.skillTagsField.name).toBe('skillTags');
    expect(view.durationField.name).toBe('defaultDurationMinutes');
    expect(view.safetyNotesField.name).toBe('safetyNotes');
    expect(view.mediaUrlField.name).toBe('mediaUrl');
  });

  it('resolves the category and intensity selects with translated options', () => {
    const view = buildDrillFormView(t, buildInput());

    expect(view.categoryField.value).toBe('throwing');
    expect(view.categoryField.options.length).toBeGreaterThan(0);
    expect(view.intensityField.value).toBe('moderate');
    expect(view.intensityField.options.length).toBeGreaterThan(0);
  });

  it('translates a field error before the presentational layer ever sees it', () => {
    const view = buildDrillFormView(
      t,
      buildInput({ nameField: binding('name', { errorMessage: 'drills.validationNameRequired' }) }),
    );

    expect(view.nameField.errorMessage).toBe('drills.validationNameRequired');
  });

  it('shows the saving label while a submit is in flight', () => {
    expect(buildDrillFormView(t, buildInput({ isSubmitting: true })).saveLabel).toBe(
      'drills.savingLabel',
    );
    expect(buildDrillFormView(t, buildInput({ isSubmitting: false })).saveLabel).toBe(
      'drills.saveLabel',
    );
  });

  it('carries the heading and control callbacks straight through', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const view = buildDrillFormView(t, buildInput({ heading: 'New drill', onSubmit, onCancel }));

    expect(view.heading).toBe('New drill');
    expect(view.onSubmit).toBe(onSubmit);
    expect(view.onCancel).toBe(onCancel);
  });
});
