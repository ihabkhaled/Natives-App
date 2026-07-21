import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useComposerDatePicker } from './use-composer-date-picker.hook';

vi.mock('@/packages/date', () => ({
  formatDate: (iso: string, locale: string) => `${locale}:${iso}`,
}));

describe('useComposerDatePicker', () => {
  it('shows nothing at all while no day is chosen', () => {
    const { result } = renderHook(() => useComposerDatePicker('', 'en'));

    expect(result.current.displayValue).toBe('');
    expect(result.current.isOpen).toBe(false);
  });

  it('formats the chosen day in the active locale', () => {
    const { result } = renderHook(() => useComposerDatePicker('2026-07-12', 'ar'));

    expect(result.current.displayValue).toBe('ar:2026-07-12');
  });

  it('opens and dismisses on demand', () => {
    const { result } = renderHook(() => useComposerDatePicker('', 'en'));

    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.dismiss();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('commits the choice and closes in the same gesture', () => {
    const commit = vi.fn();
    const { result } = renderHook(() => useComposerDatePicker('', 'en'));

    act(() => {
      result.current.open();
    });
    act(() => {
      result.current.choose('2026-07-12', commit);
    });

    expect(commit).toHaveBeenCalledWith('2026-07-12');
    expect(result.current.isOpen).toBe(false);
  });
});
