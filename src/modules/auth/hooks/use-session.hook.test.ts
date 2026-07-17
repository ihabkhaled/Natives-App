import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useSessionStore } from '../store/session.store';
import { SESSION_STATUS } from '../types/auth.types';
import { useSession } from './use-session.hook';

beforeEach(() => {
  useSessionStore.setState({ status: SESSION_STATUS.Unknown });
});

describe('useSession', () => {
  it('reports an unresolved session while the status is unknown', () => {
    const { result } = renderHook(() => useSession());

    expect(result.current).toEqual({
      status: SESSION_STATUS.Unknown,
      isAuthenticated: false,
      isResolved: false,
    });
  });

  it('reports an authenticated, resolved session', () => {
    useSessionStore.setState({ status: SESSION_STATUS.Authenticated });

    const { result } = renderHook(() => useSession());

    expect(result.current).toEqual({
      status: SESSION_STATUS.Authenticated,
      isAuthenticated: true,
      isResolved: true,
    });
  });

  it('reports an anonymous session as resolved but not authenticated', () => {
    useSessionStore.setState({ status: SESSION_STATUS.Anonymous });

    const { result } = renderHook(() => useSession());

    expect(result.current).toEqual({
      status: SESSION_STATUS.Anonymous,
      isAuthenticated: false,
      isResolved: true,
    });
  });

  it('re-renders subscribers when the session store flips', () => {
    const { result } = renderHook(() => useSession());
    expect(result.current.isAuthenticated).toBe(false);

    act(() => {
      useSessionStore.getState().markAuthenticated();
    });
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      useSessionStore.getState().markAnonymous();
    });
    expect(result.current).toEqual({
      status: SESSION_STATUS.Anonymous,
      isAuthenticated: false,
      isResolved: true,
    });
  });
});
