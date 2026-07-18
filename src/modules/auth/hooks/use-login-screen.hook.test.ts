import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAppNavigation } from '@/packages/router';
import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { buildSubmitEvent, flushAsyncWork } from '../../../../tests/setup/form-test.helper';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { useLoginMutation, type LoginMutationView } from '../mutations/use-login-mutation.hook';
import { useLoginScreen } from './use-login-screen.hook';

vi.mock('../mutations/use-login-mutation.hook', () => ({ useLoginMutation: vi.fn() }));
vi.mock('@/packages/router', () => ({ useAppNavigation: vi.fn() }));

const VALID = { email: 'ranger@example.com', password: 'Sup3rSecret!' };
const push = vi.fn();

function mockLoginMutation(overrides: Partial<LoginMutationView> = {}): LoginMutationView['login'] {
  const login = vi.fn();
  vi.mocked(useLoginMutation).mockReturnValue({
    login,
    isSubmitting: false,
    error: null,
    ...overrides,
  });
  return login;
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  vi.mocked(useAppNavigation).mockReturnValue({
    push,
    replace: vi.fn(),
    goBack: vi.fn(),
    currentPath: '/login',
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useLoginScreen', () => {
  it('exposes every label as translated English copy', () => {
    mockLoginMutation();

    const { result } = renderHook(() => useLoginScreen());

    expect(result.current.labels).toEqual({
      title: 'Sign in',
      logoLabel: 'Ultimate Natives logo',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Your password',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      submit: 'Sign in',
      submitting: 'Signing in…',
      forgotPassword: 'Forgot your password?',
    });
  });

  it('navigates to password recovery through its prepared callback', () => {
    mockLoginMutation();

    const { result } = renderHook(() => useLoginScreen());
    result.current.onForgotPassword();

    expect(push).toHaveBeenCalledExactlyOnceWith('/forgot-password');
  });

  it('exposes the login form view model', () => {
    mockLoginMutation();

    const { result } = renderHook(() => useLoginScreen());

    expect(result.current.form.email.name).toBe('email');
    expect(result.current.form.password.name).toBe('password');
    expect(result.current.form.passwordRevealed).toBe(false);
  });

  it('leaves the submit error undefined while the mutation is clean', () => {
    mockLoginMutation();

    const { result } = renderHook(() => useLoginScreen());

    expect(result.current.submitErrorMessage).toBeUndefined();
    expect(result.current.isSubmitting).toBe(false);
  });

  it('mirrors the submitting flag from the mutation', () => {
    mockLoginMutation({ isSubmitting: true });

    const { result } = renderHook(() => useLoginScreen());

    expect(result.current.isSubmitting).toBe(true);
  });

  it('translates an invalid-credentials failure into user-facing copy', () => {
    mockLoginMutation({ error: new AppError({ code: APP_ERROR_CODE.InvalidCredentials }) });

    const { result } = renderHook(() => useLoginScreen());

    expect(result.current.submitErrorMessage).toBe('The email or password is incorrect.');
  });

  it('translates a server failure into user-facing copy', () => {
    mockLoginMutation({ error: new AppError({ code: APP_ERROR_CODE.Server }) });

    const { result } = renderHook(() => useLoginScreen());

    expect(result.current.submitErrorMessage).toBe(
      'Something went wrong on our side. Please try again.',
    );
  });

  it('never leaks the raw developer message of a failure', () => {
    mockLoginMutation({
      error: new AppError({ code: APP_ERROR_CODE.Server, message: 'HTTP 500 (ECONNRESET)' }),
    });

    const { result } = renderHook(() => useLoginScreen());

    expect(result.current.submitErrorMessage).not.toContain('ECONNRESET');
  });

  it('submits the collected credentials to the login mutation', async () => {
    const login = mockLoginMutation();

    const { result } = renderHook(() => useLoginScreen());
    act(() => {
      result.current.form.email.onChange(VALID.email);
    });
    act(() => {
      result.current.form.password.onChange(VALID.password);
    });
    await act(async () => {
      result.current.form.onSubmit(buildSubmitEvent());
      await flushAsyncWork();
    });

    expect(login).toHaveBeenCalledExactlyOnceWith(VALID);
  });

  it('never submits invalid credentials', async () => {
    const login = mockLoginMutation();

    const { result } = renderHook(() => useLoginScreen());
    await act(async () => {
      result.current.form.onSubmit(buildSubmitEvent());
      await flushAsyncWork();
    });

    expect(login).not.toHaveBeenCalled();
    expect(result.current.form.email.errorMessage).toBe('Email is required.');
  });
});
