import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { buildPracticeSessionSummary } from '../../../../tests/factories/practice.factory';
import { getUpcomingPractices } from '../services/get-upcoming-practices.service';
import { useUpcomingPracticesQuery } from './use-upcoming-practices-query.hook';

vi.mock('../services/get-upcoming-practices.service', () => ({ getUpcomingPractices: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('useUpcomingPracticesQuery', () => {
  it('exposes the bounded upcoming list', async () => {
    vi.mocked(getUpcomingPractices).mockResolvedValue([buildPracticeSessionSummary()]);

    const { result } = renderHookWithProviders(() => useUpcomingPracticesQuery('team-1'));

    await waitFor(() => {
      expect(result.current.sessions).toHaveLength(1);
    });
  });

  it('surfaces a failure as an AppError', async () => {
    vi.mocked(getUpcomingPractices).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.Server }),
    );

    const { result } = renderHookWithProviders(() => useUpcomingPracticesQuery('team-1'));

    await waitFor(() => {
      expect(result.current.error?.code).toBe(APP_ERROR_CODE.Server);
    });
    result.current.refetch();
  });
});
