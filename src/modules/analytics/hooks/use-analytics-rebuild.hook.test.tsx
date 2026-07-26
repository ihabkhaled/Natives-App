import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppQueryClient, QueryClientProvider } from '@/packages/query';

import { rebuildAnalytics } from '../services/rebuild-analytics.service';
import { useAnalyticsRebuild } from './use-analytics-rebuild.hook';

vi.mock('../services/rebuild-analytics.service', () => ({ rebuildAnalytics: vi.fn() }));

function wrapper({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <QueryClientProvider client={createAppQueryClient()}>{children}</QueryClientProvider>;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('useAnalyticsRebuild', () => {
  const t = (key: string): string => key;

  it('surfaces a failed rebuild as an error message', async () => {
    vi.mocked(rebuildAnalytics).mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useAnalyticsRebuild(t, 't1', false), { wrapper });

    act(() => {
      result.current.onOpenRebuild();
    });
    expect(result.current.dialog).not.toBeNull();
    act(() => result.current.dialog?.onConfirm());

    await waitFor(() => {
      expect(result.current.error).toBe('analytics.rebuildFailed');
    });
  });

  it('banners a successful rebuild report', async () => {
    vi.mocked(rebuildAnalytics).mockResolvedValue({
      seasonId: null,
      periodType: 'monthly',
      calculationVersion: 'analytics-v1',
      subjectsProjected: 22,
      projectionsWritten: 88,
      computedAtIso: '2026-07-23T09:00:00.000Z',
    });
    const { result } = renderHook(() => useAnalyticsRebuild(t, 't1', false), { wrapper });

    act(() => {
      result.current.onOpenRebuild();
    });
    act(() => result.current.dialog?.onPeriodChange('season'));
    act(() => result.current.dialog?.onConfirm());

    await waitFor(() => {
      expect(result.current.banner).not.toBeNull();
    });
  });

  it('closes the dialog on cancel', () => {
    const { result } = renderHook(() => useAnalyticsRebuild(t, 't1', true), { wrapper });
    act(() => {
      result.current.onOpenRebuild();
    });
    expect(result.current.dialog?.canConfirm).toBe(false);
    act(() => result.current.dialog?.onCancel());
    expect(result.current.dialog).toBeNull();
  });
});
