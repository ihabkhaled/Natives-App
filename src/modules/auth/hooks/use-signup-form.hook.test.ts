import { act, renderHook } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { translateNow } from '@/packages/i18n';

import { buildSubmitEvent, flushAsyncWork } from '../../../../tests/setup/form-test.helper';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { useSignupForm, type SignupFormView } from './use-signup-form.hook';

const STRONG_PASSWORD = 'Ranger#Strong1234';
const NAME = 'Nadia Newcomer';
const EMAIL = 'nadia@example.com';

interface Harness {
  readonly view: () => SignupFormView;
  readonly onValidSubmit: ReturnType<typeof vi.fn>;
}

function mountForm(): Harness {
  const onValidSubmit = vi.fn();
  const { result } = renderHook(() => useSignupForm({ translate: translateNow, onValidSubmit }));
  return { view: () => result.current, onValidSubmit };
}

function fill(harness: Harness, name: string, email: string, password: string): void {
  act(() => {
    harness.view().displayName.onChange(name);
  });
  act(() => {
    harness.view().email.onChange(email);
  });
  act(() => {
    harness.view().password.onChange(password);
  });
}

async function submit(harness: Harness): Promise<void> {
  await act(async () => {
    harness.view().onSubmit(buildSubmitEvent());
    await flushAsyncWork();
  });
}

function keyEvent(capsOn: boolean): React.KeyboardEvent {
  return { getModifierState: () => capsOn } as unknown as React.KeyboardEvent;
}

beforeAll(async () => {
  await initTestI18n();
});

describe('useSignupForm', () => {
  it('starts empty, masked, Caps-Lock-free and without a summary', () => {
    const harness = mountForm();

    expect(harness.view().displayName.value).toBe('');
    expect(harness.view().email.value).toBe('');
    expect(harness.view().passwordRevealed).toBe(false);
    expect(harness.view().capsLockOn).toBe(false);
    expect(harness.view().summaryMessages).toEqual([]);
  });

  it('toggles the password reveal', () => {
    const harness = mountForm();

    act(() => {
      harness.view().onTogglePasswordReveal();
    });

    expect(harness.view().passwordRevealed).toBe(true);
  });

  it('mirrors the Caps Lock modifier from key events', () => {
    const harness = mountForm();

    act(() => {
      harness.view().onPasswordKeyUp(keyEvent(true));
    });
    expect(harness.view().capsLockOn).toBe(true);

    act(() => {
      harness.view().onPasswordKeyUp(keyEvent(false));
    });
    expect(harness.view().capsLockOn).toBe(false);
  });

  it('translates every field error and lists them in submission order', async () => {
    const harness = mountForm();

    fill(harness, '', 'nope', 'weak');
    await submit(harness);

    expect(harness.view().displayName.errorMessage).toBe('Enter the name your team will see.');
    expect(harness.view().email.errorMessage).toBe('Enter a valid email address.');
    expect(harness.view().summaryMessages).toEqual([
      'Enter the name your team will see.',
      'Enter a valid email address.',
      'Use at least 12 characters with upper- and lower-case letters and a number.',
    ]);
    expect(harness.onValidSubmit).not.toHaveBeenCalled();
  });

  it('reports the trimmed values once every field is valid', async () => {
    const harness = mountForm();

    fill(harness, `  ${NAME}  `, EMAIL, STRONG_PASSWORD);
    await submit(harness);

    expect(harness.onValidSubmit).toHaveBeenCalledExactlyOnceWith({
      displayName: NAME,
      email: EMAIL,
      password: STRONG_PASSWORD,
    });
    expect(harness.view().summaryMessages).toEqual([]);
  });
});
