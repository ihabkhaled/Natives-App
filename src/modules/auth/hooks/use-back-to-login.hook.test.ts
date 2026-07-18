import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { loginPath } from '../routes/auth.paths';
import { useBackToLogin } from './use-back-to-login.hook';

const pushSpy = vi.fn();

vi.mock('@/packages/router', () => ({
  useAppNavigation: () => ({
    push: pushSpy,
    replace: vi.fn(),
    goBack: vi.fn(),
    currentPath: '/forgot-password',
  }),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('useBackToLogin', () => {
  it('navigates to the login route when invoked', () => {
    const { result } = renderHook(() => useBackToLogin());

    result.current();

    expect(pushSpy).toHaveBeenCalledExactlyOnceWith(loginPath());
  });
});
