import { act, renderHook } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { translateNow } from '@/packages/i18n';

import { buildSubmitEvent, flushAsyncWork } from '../../../../tests/setup/form-test.helper';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { useLoginForm, type LoginFormView } from './use-login-form.hook';

const VALID = { email: 'ranger@example.com', password: 'Sup3rSecret!' };

function renderLoginForm(onValidSubmit = vi.fn()): {
  readonly current: () => LoginFormView;
  readonly onValidSubmit: typeof onValidSubmit;
} {
  const { result } = renderHook(() => useLoginForm({ translate: translateNow, onValidSubmit }));
  return { current: () => result.current, onValidSubmit };
}

async function submit(view: { readonly current: () => LoginFormView }): Promise<void> {
  await act(async () => {
    view.current().onSubmit(buildSubmitEvent());
    await flushAsyncWork();
  });
}

function fill(view: { readonly current: () => LoginFormView }, values: typeof VALID): void {
  act(() => {
    view.current().email.onChange(values.email);
  });
  act(() => {
    view.current().password.onChange(values.password);
  });
}

beforeAll(async () => {
  await initTestI18n();
});

describe('useLoginForm', () => {
  it('starts with empty, error-free fields and a masked password', () => {
    const view = renderLoginForm();

    expect(view.current().email.value).toBe('');
    expect(view.current().password.value).toBe('');
    expect(view.current().email.errorMessage).toBeUndefined();
    expect(view.current().password.errorMessage).toBeUndefined();
    expect(view.current().passwordRevealed).toBe(false);
  });

  it('binds each field to its name', () => {
    const view = renderLoginForm();

    expect(view.current().email.name).toBe('email');
    expect(view.current().password.name).toBe('password');
  });

  it('updates field values as the user types', () => {
    const view = renderLoginForm();

    fill(view, VALID);

    expect(view.current().email.value).toBe(VALID.email);
    expect(view.current().password.value).toBe(VALID.password);
  });

  it('toggles the password reveal on and off', () => {
    const view = renderLoginForm();

    act(() => {
      view.current().onTogglePasswordReveal();
    });
    expect(view.current().passwordRevealed).toBe(true);

    act(() => {
      view.current().onTogglePasswordReveal();
    });
    expect(view.current().passwordRevealed).toBe(false);
  });

  it('translates the required-field errors on an empty submit', async () => {
    const view = renderLoginForm();

    await submit(view);

    expect(view.current().email.errorMessage).toBe('Email is required.');
    expect(view.current().password.errorMessage).toBe('Password is required.');
    expect(view.onValidSubmit).not.toHaveBeenCalled();
  });

  it('translates the malformed-email error', async () => {
    const view = renderLoginForm();

    fill(view, { email: 'ranger@', password: VALID.password });
    await submit(view);

    expect(view.current().email.errorMessage).toBe('Enter a valid email address.');
    expect(view.onValidSubmit).not.toHaveBeenCalled();
  });

  it('translates the short-password error', async () => {
    const view = renderLoginForm();

    fill(view, { email: VALID.email, password: 'short' });
    await submit(view);

    expect(view.current().password.errorMessage).toBe('Password must be at least 8 characters.');
    expect(view.onValidSubmit).not.toHaveBeenCalled();
  });

  it('validates a touched field on blur', async () => {
    const view = renderLoginForm();

    await act(async () => {
      view.current().email.onBlur();
      await flushAsyncWork();
    });

    expect(view.current().email.errorMessage).toBe('Email is required.');
  });

  it('reports the submitted values when the form is valid', async () => {
    const view = renderLoginForm();

    fill(view, VALID);
    await submit(view);

    expect(view.onValidSubmit).toHaveBeenCalledExactlyOnceWith(VALID);
    expect(view.current().email.errorMessage).toBeUndefined();
    expect(view.current().password.errorMessage).toBeUndefined();
  });

  it('clears the error once the invalid input is corrected', async () => {
    const view = renderLoginForm();

    await submit(view);
    expect(view.current().email.errorMessage).toBe('Email is required.');

    fill(view, VALID);
    await submit(view);

    expect(view.current().email.errorMessage).toBeUndefined();
    expect(view.onValidSubmit).toHaveBeenCalledExactlyOnceWith(VALID);
  });
});
