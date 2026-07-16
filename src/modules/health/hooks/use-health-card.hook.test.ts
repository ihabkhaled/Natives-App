import { renderHook } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { useHealthQuery, type HealthQueryView } from './use-health-query.hook';
import { useHealthCard } from './use-health-card.hook';

vi.mock('./use-health-query.hook', () => ({ useHealthQuery: vi.fn() }));

const HEALTHY = { isHealthy: true, version: '1.4.2', checkedAtIso: '2026-07-16T10:15:00.000Z' };

function mockHealthQuery(overrides: Partial<HealthQueryView> = {}): HealthQueryView['refetch'] {
  const refetch = vi.fn();
  vi.mocked(useHealthQuery).mockReturnValue({
    health: undefined,
    isLoading: false,
    error: null,
    refetch,
    ...overrides,
  });
  return refetch;
}

afterEach(() => {
  vi.clearAllMocks();
});

beforeAll(async () => {
  await initTestI18n();
});

describe('useHealthCard', () => {
  it('always exposes the translated static labels', () => {
    mockHealthQuery();

    const { result } = renderHook(() => useHealthCard());

    expect(result.current.title).toBe('API health');
    expect(result.current.loadingLabel).toBe('Loading…');
    expect(result.current.retryLabel).toBe('Try again');
    expect(result.current.versionLabel).toBe('Version');
    expect(result.current.checkedAtLabel).toBe('Checked');
  });

  it('reports the loading view while the probe is in flight', () => {
    mockHealthQuery({ isLoading: true });

    const { result } = renderHook(() => useHealthCard());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.errorMessage).toBeUndefined();
    expect(result.current.version).toBe('');
    expect(result.current.checkedAtText).toBe('');
  });

  it('reports the error view with translated copy and a down status', () => {
    mockHealthQuery({ error: new AppError({ code: APP_ERROR_CODE.Server }) });

    const { result } = renderHook(() => useHealthCard());

    expect(result.current.errorMessage).toBe('Something went wrong on our side. Please try again.');
    expect(result.current.statusLabel).toBe('Unavailable');
    expect(result.current.isHealthy).toBe(false);
  });

  it('never leaks the raw developer message of a failure', () => {
    mockHealthQuery({
      error: new AppError({ code: APP_ERROR_CODE.NetworkOffline, message: 'ECONNREFUSED' }),
    });

    const { result } = renderHook(() => useHealthCard());

    expect(result.current.errorMessage).toBe(
      'You appear to be offline. Check your connection and try again.',
    );
  });

  it('reports the healthy view with the version and a formatted timestamp', () => {
    mockHealthQuery({ health: HEALTHY });

    const { result } = renderHook(() => useHealthCard());

    expect(result.current.isHealthy).toBe(true);
    expect(result.current.statusLabel).toBe('Operational');
    expect(result.current.version).toBe('1.4.2');
    expect(result.current.errorMessage).toBeUndefined();
    expect(result.current.checkedAtText).not.toBe('');
    expect(result.current.checkedAtText).toContain('2026');
  });

  it('reports an unhealthy backend as down while still showing its metadata', () => {
    mockHealthQuery({ health: { ...HEALTHY, isHealthy: false } });

    const { result } = renderHook(() => useHealthCard());

    expect(result.current.isHealthy).toBe(false);
    expect(result.current.statusLabel).toBe('Unavailable');
    expect(result.current.version).toBe('1.4.2');
  });

  it('delegates refresh to the query hook', () => {
    const refetch = mockHealthQuery({ health: HEALTHY });

    const { result } = renderHook(() => useHealthCard());
    result.current.onRefresh();

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
