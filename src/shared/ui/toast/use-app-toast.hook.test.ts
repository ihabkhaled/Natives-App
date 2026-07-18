import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as IonicPackage from '@/packages/ionic';

import { TOAST_DEFAULT_DURATION_MS, TOAST_TONE_TO_ION_COLOR } from './toast.constants';
import { useAppToast } from './use-app-toast.hook';

const { presentToast, dismissToast } = vi.hoisted(() => ({
  presentToast: vi.fn<(options: Record<string, unknown>) => Promise<void>>(),
  dismissToast: vi.fn<() => Promise<void>>(),
}));

vi.mock('@/packages/ionic', async (importOriginal) => {
  const actual = await importOriginal<typeof IonicPackage>();
  return { ...actual, useIonToast: () => [presentToast, dismissToast] };
});

function lastToastOptions(): Record<string, unknown> {
  return presentToast.mock.calls.at(-1)![0];
}

describe('useAppToast', () => {
  beforeEach(() => {
    presentToast.mockClear();
  });

  it('presents a bottom toast with the default duration', async () => {
    const { result } = renderHook(() => useAppToast());

    await result.current.showToast({ message: 'Saved' });

    expect(presentToast).toHaveBeenCalledTimes(1);
    expect(lastToastOptions()).toStrictEqual({
      message: 'Saved',
      duration: 2500,
      position: 'bottom',
    });
    expect(TOAST_DEFAULT_DURATION_MS).toBe(2500);
  });

  it('presents a neutral toast without a color key', async () => {
    const { result } = renderHook(() => useAppToast());

    await result.current.showToast({ message: 'Saved', tone: 'neutral' });

    expect(Object.keys(lastToastOptions())).not.toContain('color');
  });

  it('defaults to the neutral tone when no tone is provided', async () => {
    const { result } = renderHook(() => useAppToast());

    await result.current.showToast({ message: 'Saved' });

    expect(Object.keys(lastToastOptions())).not.toContain('color');
  });

  it('maps the danger tone to the danger Ionic color', async () => {
    const { result } = renderHook(() => useAppToast());

    await result.current.showToast({ message: 'Failed', tone: 'danger' });

    expect(lastToastOptions()).toStrictEqual({
      message: 'Failed',
      duration: 2500,
      position: 'bottom',
      color: 'danger',
    });
  });

  it.each(['success', 'warning', 'danger'] as const)(
    'maps the %s tone to its Ionic color',
    async (tone) => {
      const { result } = renderHook(() => useAppToast());

      await result.current.showToast({ message: 'Notice', tone });

      expect(lastToastOptions()['color']).toBe(TOAST_TONE_TO_ION_COLOR[tone]);
    },
  );

  it('honours a custom duration', async () => {
    const { result } = renderHook(() => useAppToast());

    await result.current.showToast({ message: 'Saved', durationMs: 8000 });

    expect(lastToastOptions()['duration']).toBe(8000);
  });

  it('forwards one accessible action without invoking it eagerly', async () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useAppToast());

    await result.current.showToast({
      message: 'Update ready',
      action: { label: 'Restart', onSelect },
    });

    expect(lastToastOptions()['buttons']).toStrictEqual([
      {
        text: 'Restart',
        handler: onSelect,
      },
    ]);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
