import { describe, expect, it, vi } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';
import { buildMyMeasurementsResponse } from '@/tests/msw/assessments-insights.fixture';

import { measurementHistoryResponseSchema } from '../schemas/measurements.schema';
import { requestMyMeasurements } from '../gateways/measurements.gateway';
import { getMyMeasurements } from './get-my-measurements.service';

vi.mock('../gateways/measurements.gateway', () => ({ requestMyMeasurements: vi.fn() }));

describe('getMyMeasurements', () => {
  it('maps the per-protocol history for the caller', async () => {
    vi.mocked(requestMyMeasurements).mockResolvedValue(
      measurementHistoryResponseSchema.parse(buildMyMeasurementsResponse()),
    );

    const history = await getMyMeasurements('team-1');

    expect(history).toHaveLength(1);
    expect(history[0]?.protocolId).toBe('protocol-sprint-20');
  });

  it('normalizes a transport failure into an AppError', async () => {
    vi.mocked(requestMyMeasurements).mockRejectedValue(
      new HttpError({ kind: HTTP_ERROR_KIND.Server }),
    );

    await expect(getMyMeasurements('team-1')).rejects.toMatchObject({
      code: APP_ERROR_CODE.Server,
    });
  });
});
