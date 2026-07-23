import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';
import { buildMyScoreResponse } from '@/tests/msw/assessments-insights.fixture';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { mapMyPerformanceScore } from '../mappers/scoring.mapper';
import { scoreListResponseSchema } from '../schemas/scoring.schema';
import {
  buildMyMeasurementsQueryOptions,
  buildMyScoreQueryOptions,
} from '../queries/development.query';
import { getMyScore } from '../services/get-my-score.service';
import { useMyScoreQuery } from './use-my-score-query.hook';

vi.mock('../services/get-my-score.service', () => ({ getMyScore: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('useMyScoreQuery', () => {
  it('exposes the own computed score once the grant is proven', async () => {
    vi.mocked(getMyScore).mockResolvedValue(
      mapMyPerformanceScore(scoreListResponseSchema.parse(buildMyScoreResponse())),
    );

    const { result } = renderHookWithProviders(() => useMyScoreQuery('team-1', true));

    await waitFor(() => {
      expect(result.current.score?.value).toBe(78.4);
    });
  });

  it('surfaces a failure as an AppError', async () => {
    vi.mocked(getMyScore).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Server }));

    const { result } = renderHookWithProviders(() => useMyScoreQuery('team-1', true));

    await waitFor(() => {
      expect(result.current.error?.code).toBe(APP_ERROR_CODE.Server);
    });
  });

  it('never fires without analytics.read.self — the P1-5 zero-403 rule', () => {
    const { result } = renderHookWithProviders(() => useMyScoreQuery('team-1', false));

    expect(getMyScore).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('also stays idle before the team scope resolves', () => {
    expect(buildMyScoreQueryOptions('', true).enabled).toBe(false);
    expect(buildMyMeasurementsQueryOptions('', true).enabled).toBe(false);
  });
});
