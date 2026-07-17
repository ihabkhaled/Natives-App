import { act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { getHealthStatus } from '../services/get-health.service';
import { useHealthQuery } from './use-health-query.hook';

vi.mock('../services/get-health.service', () => ({ getHealthStatus: vi.fn() }));

const STATUS = { isHealthy: true, version: '1.4.2', checkedAtIso: '2026-07-16T10:15:00.000Z' };

afterEach(() => {
  vi.clearAllMocks();
});

describe('useHealthQuery', () => {
  it('starts pending with no health snapshot and no error', () => {
    vi.mocked(getHealthStatus).mockResolvedValue(STATUS);

    const { result } = renderHookWithProviders(() => useHealthQuery());

    expect(result.current.health).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('exposes the health snapshot once it resolves', async () => {
    vi.mocked(getHealthStatus).mockResolvedValue(STATUS);

    const { result } = renderHookWithProviders(() => useHealthQuery());

    await waitFor(() => {
      expect(result.current.health).toEqual(STATUS);
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('surfaces a failure as an AppError', async () => {
    vi.mocked(getHealthStatus).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Server }));

    const { result } = renderHookWithProviders(() => useHealthQuery());

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(AppError);
    });
    expect(result.current.error?.code).toBe(APP_ERROR_CODE.Server);
    expect(result.current.health).toBeUndefined();
  });

  it('normalizes a non-AppError failure into an AppError', async () => {
    vi.mocked(getHealthStatus).mockRejectedValue(new Error('boom'));

    const { result } = renderHookWithProviders(() => useHealthQuery());

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(AppError);
    });
    expect(result.current.error?.code).toBe(APP_ERROR_CODE.Unexpected);
  });

  it('refetches the health probe on demand', async () => {
    vi.mocked(getHealthStatus).mockResolvedValue(STATUS);

    const { result } = renderHookWithProviders(() => useHealthQuery());
    await waitFor(() => {
      expect(result.current.health).toEqual(STATUS);
    });

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(getHealthStatus).toHaveBeenCalledTimes(2);
    });
    expect(result.current.health).toEqual(STATUS);
  });
});
