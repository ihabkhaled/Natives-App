import { describe, expect, it } from 'vitest';

import { buildRsvpSummary } from '../../../../tests/factories/practice-rsvp-detail.factory';
import { buildSummaryView } from './rsvp-summary-view.helper';

const t = (key: string, params?: Readonly<Record<string, unknown>>): string =>
  params === undefined ? key : `${key}:${JSON.stringify(params)}`;

describe('buildSummaryView', () => {
  it('returns null before the summary has loaded', () => {
    expect(buildSummaryView(t, undefined)).toBeNull();
  });

  it('carries every count through with its number', () => {
    const view = buildSummaryView(t, buildRsvpSummary({ going: 5, maybe: 2 }));

    expect(view?.goingLabel).toContain('"count":5');
    expect(view?.maybeLabel).toContain('"count":2');
  });

  it('states capacity and spots remaining when the session has both', () => {
    const view = buildSummaryView(t, buildRsvpSummary({ capacity: 20, spotsRemaining: 8 }));

    expect(view?.capacityLabel).toBe('practiceRsvpDetail.summaryCapacity:{"count":20}');
    expect(view?.spotsRemainingLabel).toBe(
      'practiceRsvpDetail.summarySpotsRemaining:{"count":8}',
    );
  });

  /** A session nobody capped is not a session already full — null is not zero. */
  it('states "unlimited" rather than zero when capacity and spots are null', () => {
    const view = buildSummaryView(t, buildRsvpSummary({ capacity: null, spotsRemaining: null }));

    expect(view?.capacityLabel).toBe('practiceRsvpDetail.summaryCapacityUnlimited');
    expect(view?.spotsRemainingLabel).toBe('practiceRsvpDetail.summarySpotsRemainingUnlimited');
  });
});
