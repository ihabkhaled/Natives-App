import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { getMyMeasurements } from '../services/get-my-measurements.service';
import { useMyMeasurementsQuery } from './use-my-measurements-query.hook';

vi.mock('../services/get-my-measurements.service', () => ({ getMyMeasurements: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('useMyMeasurementsQuery', () => {
  it('exposes the own history once the grant is proven', async () => {
    vi.mocked(getMyMeasurements).mockResolvedValue([]);

    const { result } = renderHookWithProviders(() => useMyMeasurementsQuery('team-1', true));

    await waitFor(() => {
      expect(result.current.history).toEqual([]);
    });
  });

  it('surfaces a failure as an AppError and never fires ungranted', async () => {
    vi.mocked(getMyMeasurements).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Server }));

    const { result } = renderHookWithProviders(() => useMyMeasurementsQuery('team-1', true));
    await waitFor(() => {
      expect(result.current.error?.code).toBe(APP_ERROR_CODE.Server);
    });

    vi.clearAllMocks();
    const { result: gatedResult } = renderHookWithProviders(() =>
      useMyMeasurementsQuery('team-1', false),
    );
    expect(getMyMeasurements).not.toHaveBeenCalled();
    expect(gatedResult.current.isLoading).toBe(false);
  });
});
