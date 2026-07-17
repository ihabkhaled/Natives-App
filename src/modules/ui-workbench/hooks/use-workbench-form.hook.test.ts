import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import { buildSubmitEvent, flushAsyncWork } from '../../../../tests/setup/form-test.helper';
import { useWorkbenchForm, type WorkbenchFormView } from './use-workbench-form.hook';

const VALID = { name: 'Ranger', email: 'ranger@example.com' };

function translate(key: string): string {
  return `translated(${key})`;
}

function renderForm(
  translateSpy: (key: string) => string = translate,
): ReturnType<typeof renderHook<WorkbenchFormView, unknown>> {
  return renderHook(() => useWorkbenchForm({ translate: translateSpy }));
}

async function submit(result: { current: WorkbenchFormView }): Promise<void> {
  await act(async () => {
    result.current.onSubmit(buildSubmitEvent());
    await flushAsyncWork();
  });
}

describe('useWorkbenchForm', () => {
  it('starts with empty fields, no errors, and nothing submitted', () => {
    const { result } = renderForm();

    expect(result.current.name).toMatchObject({ name: 'name', value: '', errorMessage: undefined });
    expect(result.current.email).toMatchObject({
      name: 'email',
      value: '',
      errorMessage: undefined,
    });
    expect(result.current.submittedName).toBeUndefined();
  });

  it('records a name change', () => {
    const { result } = renderForm();

    act(() => {
      result.current.name.onChange(VALID.name);
    });

    expect(result.current.name.value).toBe(VALID.name);
  });

  it('records an email change', () => {
    const { result } = renderForm();

    act(() => {
      result.current.email.onChange(VALID.email);
    });

    expect(result.current.email.value).toBe(VALID.email);
  });

  it('translates validation errors raised by an invalid submit', async () => {
    const { result } = renderForm();

    await submit(result);

    expect(result.current.name.errorMessage).toBe(
      `translated(${I18N_KEYS.workbench.formValidationNameRequired})`,
    );
    expect(result.current.email.errorMessage).toBe(
      `translated(${I18N_KEYS.workbench.formValidationEmailInvalid})`,
    );
  });

  it('never reports a submission when the values are invalid', async () => {
    const { result } = renderForm();

    await submit(result);

    expect(result.current.submittedName).toBeUndefined();
  });

  it('reports a validation error for a malformed email alone', async () => {
    const { result } = renderForm();

    act(() => {
      result.current.name.onChange(VALID.name);
    });
    act(() => {
      result.current.email.onChange('ranger@');
    });
    await submit(result);

    expect(result.current.name.errorMessage).toBeUndefined();
    expect(result.current.email.errorMessage).toBe(
      `translated(${I18N_KEYS.workbench.formValidationEmailInvalid})`,
    );
    expect(result.current.submittedName).toBeUndefined();
  });

  it('publishes the submitted name once the values validate', async () => {
    const { result } = renderForm();

    act(() => {
      result.current.name.onChange(VALID.name);
    });
    act(() => {
      result.current.email.onChange(VALID.email);
    });
    await submit(result);

    expect(result.current.submittedName).toBe(VALID.name);
    expect(result.current.name.errorMessage).toBeUndefined();
    expect(result.current.email.errorMessage).toBeUndefined();
  });

  it('passes only i18n keys to the translator, never raw copy', async () => {
    const translateSpy = vi.fn(translate);
    const { result } = renderForm(translateSpy);

    await submit(result);

    expect(translateSpy).toHaveBeenCalledWith(I18N_KEYS.workbench.formValidationNameRequired);
    for (const [key] of translateSpy.mock.calls) {
      expect(key.startsWith('workbench.formValidation')).toBe(true);
    }
  });

  it('leaves a clean field untranslated', () => {
    const translateSpy = vi.fn(translate);
    renderForm(translateSpy);

    expect(translateSpy).not.toHaveBeenCalled();
  });

  it('validates a touched field on blur', async () => {
    const { result } = renderForm();

    await act(async () => {
      result.current.name.onBlur();
      await flushAsyncWork();
    });

    expect(result.current.name.errorMessage).toBe(
      `translated(${I18N_KEYS.workbench.formValidationNameRequired})`,
    );
  });

  it('clears the error once the field is corrected', async () => {
    const { result } = renderForm();

    await submit(result);
    expect(result.current.name.errorMessage).toBeDefined();

    await act(async () => {
      result.current.name.onChange(VALID.name);
      await flushAsyncWork();
    });

    expect(result.current.name.errorMessage).toBeUndefined();
  });
});
