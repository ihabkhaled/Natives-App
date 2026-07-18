import { act, renderHook } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { translateNow } from '@/packages/i18n';

import { buildSubmitEvent, flushAsyncWork } from '../../../../tests/setup/form-test.helper';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import {
  useForgotPasswordForm,
  type ForgotPasswordFormView,
} from './use-forgot-password-form.hook';

function renderForgotForm(onValidSubmit = vi.fn()): {
  readonly current: () => ForgotPasswordFormView;
  readonly onValidSubmit: typeof onValidSubmit;
} {
  const { result } = renderHook(() =>
    useForgotPasswordForm({ translate: translateNow, onValidSubmit }),
  );
  return { current: () => result.current, onValidSubmit };
}

async function submitForm(view: { readonly current: () => ForgotPasswordFormView }): Promise<void> {
  await act(async () => {
    view.current().onSubmit(buildSubmitEvent());
    await flushAsyncWork();
  });
}

beforeAll(async () => {
  await initTestI18n();
});

describe('useForgotPasswordForm', () => {
  it('starts with an empty, error-free email bound to its name', () => {
    const view = renderForgotForm();

    expect(view.current().email.value).toBe('');
    expect(view.current().email.name).toBe('email');
    expect(view.current().email.errorMessage).toBeUndefined();
  });

  it('translates the required error on an empty submit', async () => {
    const view = renderForgotForm();

    await submitForm(view);

    expect(view.current().email.errorMessage).toBe('Email is required.');
    expect(view.onValidSubmit).not.toHaveBeenCalled();
  });

  it('translates the malformed-email error', async () => {
    const view = renderForgotForm();

    act(() => {
      view.current().email.onChange('not-an-email');
    });
    await submitForm(view);

    expect(view.current().email.errorMessage).toBe('Enter a valid email address.');
  });

  it('reports the trimmed email when valid', async () => {
    const view = renderForgotForm();

    act(() => {
      view.current().email.onChange('user@example.com');
    });
    await submitForm(view);

    expect(view.onValidSubmit).toHaveBeenCalledExactlyOnceWith({ email: 'user@example.com' });
  });
});
