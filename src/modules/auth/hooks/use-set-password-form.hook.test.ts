import { act, renderHook } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { translateNow } from '@/packages/i18n';

import { buildSubmitEvent, flushAsyncWork } from '../../../../tests/setup/form-test.helper';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { useSetPasswordForm, type SetPasswordFormView } from './use-set-password-form.hook';

const STRONG = 'Ranger#Strong1234';

function renderSetPasswordForm(onValidSubmit = vi.fn()): {
  readonly current: () => SetPasswordFormView;
  readonly onValidSubmit: typeof onValidSubmit;
} {
  const { result } = renderHook(() =>
    useSetPasswordForm({ translate: translateNow, onValidSubmit }),
  );
  return { current: () => result.current, onValidSubmit };
}

function typePasswords(
  view: { readonly current: () => SetPasswordFormView },
  password: string,
  confirm: string,
): void {
  act(() => {
    view.current().password.onChange(password);
  });
  act(() => {
    view.current().confirmPassword.onChange(confirm);
  });
}

async function submitForm(view: { readonly current: () => SetPasswordFormView }): Promise<void> {
  await act(async () => {
    view.current().onSubmit(buildSubmitEvent());
    await flushAsyncWork();
  });
}

function fakeKeyEvent(capsOn: boolean): React.KeyboardEvent {
  return { getModifierState: () => capsOn } as unknown as React.KeyboardEvent;
}

beforeAll(async () => {
  await initTestI18n();
});

describe('useSetPasswordForm', () => {
  it('starts masked, Caps-Lock-free, with an empty error summary', () => {
    const view = renderSetPasswordForm();

    expect(view.current().passwordRevealed).toBe(false);
    expect(view.current().confirmRevealed).toBe(false);
    expect(view.current().capsLockOn).toBe(false);
    expect(view.current().summaryMessages).toEqual([]);
  });

  it('toggles each reveal independently', () => {
    const view = renderSetPasswordForm();

    act(() => {
      view.current().onTogglePasswordReveal();
    });
    act(() => {
      view.current().onToggleConfirmReveal();
    });

    expect(view.current().passwordRevealed).toBe(true);
    expect(view.current().confirmRevealed).toBe(true);
  });

  it('reflects Caps Lock state from key events', () => {
    const view = renderSetPasswordForm();

    act(() => {
      view.current().onPasswordKeyUp(fakeKeyEvent(true));
    });
    expect(view.current().capsLockOn).toBe(true);

    act(() => {
      view.current().onPasswordKeyUp(fakeKeyEvent(false));
    });
    expect(view.current().capsLockOn).toBe(false);
  });

  it('translates the weak-password error and lists it in the summary', async () => {
    const view = renderSetPasswordForm();

    typePasswords(view, 'weak', 'weak');
    await submitForm(view);

    expect(view.current().password.errorMessage).toBe(
      'Use at least 12 characters with upper- and lower-case letters and a number.',
    );
    expect(view.current().summaryMessages.length).toBeGreaterThan(0);
    expect(view.onValidSubmit).not.toHaveBeenCalled();
  });

  it('translates the mismatch error on the confirmation field', async () => {
    const view = renderSetPasswordForm();

    typePasswords(view, STRONG, `${STRONG}x`);
    await submitForm(view);

    expect(view.current().confirmPassword.errorMessage).toBe('Passwords do not match.');
  });

  it('reports the values when the password is strong and matches', async () => {
    const view = renderSetPasswordForm();

    typePasswords(view, STRONG, STRONG);
    await submitForm(view);

    expect(view.onValidSubmit).toHaveBeenCalledExactlyOnceWith({
      password: STRONG,
      confirmPassword: STRONG,
    });
    expect(view.current().summaryMessages).toEqual([]);
  });
});
