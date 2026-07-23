import { describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';
import { buildMyScoreResponse } from '@/tests/msw/assessments-insights.fixture';

import { scoreListResponseSchema } from '../schemas/scoring.schema';
import { requestMyPerformanceScore } from '../gateways/scoring.gateway';
import { getMyScore } from './get-my-score.service';

vi.mock('../gateways/scoring.gateway', () => ({ requestMyPerformanceScore: vi.fn() }));

describe('getMyScore', () => {
  it('maps the newest computed score for the caller', async () => {
    vi.mocked(requestMyPerformanceScore).mockResolvedValue(
      scoreListResponseSchema.parse(buildMyScoreResponse()),
    );

    const score = await getMyScore('team-1');

    expect(score?.value).toBe(78.4);
  });

  it('normalizes a forbidden read into an AppError', async () => {
    vi.mocked(requestMyPerformanceScore).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.Forbidden }),
    );

    await expect(getMyScore('team-1')).rejects.toMatchObject({ code: APP_ERROR_CODE.Forbidden });
  });
});
