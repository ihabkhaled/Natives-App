import { describe, expect, it } from 'vitest';

import { buildMyMeasurementsResponse } from '@/tests/msw/assessments-insights.fixture';

import { measurementHistoryResponseSchema } from '../schemas/measurements.schema';

import { mapMeasurementHistory } from './measurements.mapper';

describe('mapMeasurementHistory', () => {
  it('groups by protocol with the policy-selected result', () => {
    const [protocol] = mapMeasurementHistory(
      measurementHistoryResponseSchema.parse(buildMyMeasurementsResponse()),
    );

    expect(protocol?.name).toBe('20m sprint');
    expect(protocol?.method).toBe('best');
    expect(protocol?.selected).toBe(3.1);
    expect(protocol?.consideredCount).toBe(2);
  });

  it('orders attempts oldest-first and keeps a DQ as a non-countable gap', () => {
    const [protocol] = mapMeasurementHistory(
      measurementHistoryResponseSchema.parse(buildMyMeasurementsResponse()),
    );

    expect(protocol?.attempts.map((attempt) => attempt.attemptNumber)).toEqual([1, 2, 3]);
    expect(protocol?.attempts[1]).toMatchObject({ canonicalValue: null, isCountable: false });
    expect(protocol?.attempts[0]?.isCountable).toBe(true);
  });

  it('projects an empty history to an empty list, not a throw', () => {
    expect(mapMeasurementHistory({ entries: [], membershipId: 'membership-1' })).toEqual([]);
  });
});
