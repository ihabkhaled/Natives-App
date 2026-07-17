import { act, renderHook } from '@testing-library/react';
import type { FieldPath } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { schemaBuilder, type SchemaOutput } from '@/packages/schema';

import { useAppFormField } from './use-app-form-field.hook';
import { useAppForm } from './use-app-form.hook';

const NAME_REQUIRED_KEY = 'workbench.formValidationNameRequired';

const workbenchFormSchema = schemaBuilder.object({
  name: schemaBuilder.string().min(1, NAME_REQUIRED_KEY),
  attempts: schemaBuilder.number(),
});

type WorkbenchForm = SchemaOutput<typeof workbenchFormSchema>;

function renderWorkbenchForm(fieldName: FieldPath<WorkbenchForm> = 'name') {
  return renderHook(() => {
    const form = useAppForm<WorkbenchForm>({
      schema: workbenchFormSchema,
      defaultValues: { name: '', attempts: 3 },
    });
    const field = useAppFormField<WorkbenchForm>({ control: form.control, name: fieldName });
    return { form, field };
  });
}

type WorkbenchFormHarness = ReturnType<typeof renderWorkbenchForm>['result'];

/** Touch the field without entering a value so the schema's required rule fires. */
function touchEmptyField(result: WorkbenchFormHarness): void {
  act(() => {
    result.current.field.onBlur();
  });
}

describe('useAppForm', () => {
  it('seeds the form with the default values', () => {
    const { result } = renderWorkbenchForm();

    expect(result.current.form.getValues()).toEqual({ name: '', attempts: 3 });
  });

  it('blocks submission while the schema rejects the values', async () => {
    const { result } = renderWorkbenchForm();
    const onValid = vi.fn<(values: WorkbenchForm) => void>();

    await act(async () => {
      await result.current.form.handleSubmit(onValid)();
    });

    expect(onValid).not.toHaveBeenCalled();
    await vi.waitFor(() => {
      expect(result.current.field.errorMessage).toBe(NAME_REQUIRED_KEY);
    });
  });

  it('submits the schema-parsed values once they are valid', async () => {
    const { result } = renderWorkbenchForm();
    const onValid = vi.fn<(values: WorkbenchForm) => void>();

    act(() => {
      result.current.field.onChange('Sam');
    });
    await act(async () => {
      await result.current.form.handleSubmit(onValid)();
    });

    expect(onValid).toHaveBeenCalledTimes(1);
    expect(onValid.mock.calls[0]?.[0]).toEqual({ name: 'Sam', attempts: 3 });
  });

  it('validates on touch rather than on every keystroke', async () => {
    const { result } = renderWorkbenchForm();

    act(() => {
      result.current.field.onChange('');
    });

    expect(result.current.field.errorMessage).toBeUndefined();

    touchEmptyField(result);

    await vi.waitFor(() => {
      expect(result.current.field.errorMessage).toBe(NAME_REQUIRED_KEY);
    });
  });
});

describe('useAppFormField', () => {
  it('binds the field name and its default value', () => {
    const { result } = renderWorkbenchForm();

    expect(result.current.field.name).toBe('name');
    expect(result.current.field.value).toBe('');
    expect(result.current.field.errorMessage).toBeUndefined();
  });

  it('writes changes back into the form state', () => {
    const { result } = renderWorkbenchForm();

    act(() => {
      result.current.field.onChange('Sam');
    });

    expect(result.current.field.value).toBe('Sam');
    expect(result.current.form.getValues('name')).toBe('Sam');
  });

  it('surfaces the schema message as a translation key', async () => {
    const { result } = renderWorkbenchForm();

    touchEmptyField(result);

    await vi.waitFor(() => {
      expect(result.current.field.errorMessage).toBe(NAME_REQUIRED_KEY);
    });
  });

  it('clears the error once the value satisfies the schema', async () => {
    const { result } = renderWorkbenchForm();
    touchEmptyField(result);
    await vi.waitFor(() => {
      expect(result.current.field.errorMessage).toBe(NAME_REQUIRED_KEY);
    });

    act(() => {
      result.current.field.onChange('Sam');
    });

    await vi.waitFor(() => {
      expect(result.current.field.errorMessage).toBeUndefined();
    });
  });

  it('falls back to an empty string for a non-string field value', () => {
    const { result } = renderWorkbenchForm('attempts');

    expect(result.current.field.name).toBe('attempts');
    expect(result.current.field.value).toBe('');
  });
});
