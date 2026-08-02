import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { buildSubmitEvent, flushAsyncWork } from '../../../../tests/setup/form-test.helper';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { useSignupMutation, type SignupMutationView } from '../mutations/use-signup-mutation.hook';
import { useSignupScreen } from './use-signup-screen.hook';

vi.mock('../mutations/use-signup-mutation.hook', () => ({ useSignupMutation: vi.fn() }));

const navigate = vi.fn();

vi.mock('@/packages/router', () => ({
  useAppNavigation: () => ({ push: navigate, replace: vi.fn(), currentPath: '/signup' }),
}));

function stubMutation(overrides: Partial<SignupMutationView> = {}): SignupMutationView {
  const view: SignupMutationView = {
    requestAccount: vi.fn(),
    isSubmitting: false,
    isSubmitted: false,
    accountState: undefined,
    error: null,
    ...overrides,
  };
  vi.mocked(useSignupMutation).mockReturnValue(view);
  return view;
}

beforeAll(async () => {
  await initTestI18n();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useSignupScreen', () => {
  it('exposes translated copy and starts on the request form', () => {
    stubMutation();

    const { result } = renderHook(() => useSignupScreen());

    expect(result.current.copy.title).toBe('Request an account');
    expect(result.current.copy.pending.title).toBe('Request received — awaiting approval');
    expect(result.current.isAwaitingApproval).toBe(false);
    expect(result.current.submitErrorMessage).toBeUndefined();
  });

  it('flips to the awaiting-approval state once the request is accepted', () => {
    stubMutation({ isSubmitted: true });

    const { result } = renderHook(() => useSignupScreen());

    expect(result.current.isAwaitingApproval).toBe(true);
  });

  it('words a 409 as an already-registered email rather than a generic conflict', () => {
    stubMutation({ error: new AppError({ code: APP_ERROR_CODE.Conflict }) });

    const { result } = renderHook(() => useSignupScreen());

    expect(result.current.submitErrorMessage).toBe(
      'That email is already registered or waiting for approval. Sign in instead, or reset your password.',
    );
  });

  it('falls back to the shared catalog for any other failure', () => {
    stubMutation({ error: new AppError({ code: APP_ERROR_CODE.NetworkOffline }) });

    const { result } = renderHook(() => useSignupScreen());

    expect(result.current.submitErrorMessage).toBe(
      'You appear to be offline. Check your connection and try again.',
    );
  });

  it('hands validated values to the mutation on submit', async () => {
    const mutation = stubMutation();

    const { result } = renderHook(() => useSignupScreen());
    act(() => {
      result.current.form.displayName.onChange('Nadia Newcomer');
    });
    act(() => {
      result.current.form.email.onChange('nadia@example.com');
    });
    act(() => {
      result.current.form.password.onChange('Ranger#Strong1234');
    });
    await act(async () => {
      result.current.form.onSubmit(buildSubmitEvent());
      await flushAsyncWork();
    });

    expect(mutation.requestAccount).toHaveBeenCalledExactlyOnceWith({
      displayName: 'Nadia Newcomer',
      email: 'nadia@example.com',
      password: 'Ranger#Strong1234',
    });
  });

  it('routes back to sign-in', () => {
    stubMutation();

    const { result } = renderHook(() => useSignupScreen());
    act(() => {
      result.current.onBackToLogin();
    });

    expect(navigate).toHaveBeenCalledWith('/login');
  });
});
