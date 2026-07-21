import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useInviteFormState } from './use-invite-form-state.hook';

vi.mock('@/packages/date', () => ({
  formatDateTime: (iso: string, locale: string) => `${locale}:${iso}`,
}));

describe('useInviteFormState', () => {
  it('starts closed, blank, and at the least-privileged access level', () => {
    const { result } = renderHook(() => useInviteFormState('en'));

    expect(result.current).toMatchObject({
      isOpen: false,
      isSubmitted: false,
      email: '',
      role: 'user',
      fullName: '',
      nickname: '',
      jersey: '',
    });
  });

  it('records every field edit, keeping the jersey as typed text', () => {
    const { result } = renderHook(() => useInviteFormState('en'));

    act(() => {
      result.current.setEmail('omar@example.com');
      result.current.setRole('admin');
      result.current.setFullName('Omar');
      result.current.setNickname('O');
      result.current.setJersey('4');
    });

    expect(result.current).toMatchObject({
      email: 'omar@example.com',
      role: 'admin',
      fullName: 'Omar',
      nickname: 'O',
      jersey: '4',
    });
  });

  it('opens, then clears everything when dismissed', () => {
    const { result } = renderHook(() => useInviteFormState('en'));

    act(() => {
      result.current.open();
    });
    act(() => {
      result.current.setEmail('omar@example.com');
      result.current.markSubmitted();
    });
    expect(result.current.isSubmitted).toBe(true);

    act(() => {
      result.current.close();
    });

    expect(result.current).toMatchObject({
      isOpen: false,
      isSubmitted: false,
      email: '',
      role: 'user',
    });
  });

  it('resets without closing, so the receipt can hand back to a blank form', () => {
    const { result } = renderHook(() => useInviteFormState('en'));

    act(() => {
      result.current.open();
    });
    act(() => {
      result.current.setEmail('omar@example.com');
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.email).toBe('');
  });

  it('formats the expiry in the active locale', () => {
    const { result } = renderHook(() => useInviteFormState('ar'));

    expect(result.current.formatExpiry('2026-07-28T00:00:00.000Z')).toBe(
      'ar:2026-07-28T00:00:00.000Z',
    );
  });
});
