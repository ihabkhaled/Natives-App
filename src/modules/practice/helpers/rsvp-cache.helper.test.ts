import { describe, expect, it } from 'vitest';

import { buildPracticeSessionDetail } from '../../../../tests/factories/practice.factory';
import { RSVP_REASON, RSVP_STATUS } from '../constants/practice.constants';
import { applyOptimisticRsvp } from './rsvp-cache.helper';

describe('applyOptimisticRsvp', () => {
  it('reflects the pending status and reason without touching the version', () => {
    const detail = buildPracticeSessionDetail();

    const next = applyOptimisticRsvp(detail, {
      status: RSVP_STATUS.notGoing,
      reasonCategory: RSVP_REASON.injury,
      version: detail.rsvp.version,
    });

    expect(next.rsvp.status).toBe(RSVP_STATUS.notGoing);
    expect(next.rsvp.reasonCategory).toBe(RSVP_REASON.injury);
    expect(next.rsvp.version).toBe(detail.rsvp.version);
    expect(next.rsvp.waitlisted).toBe(detail.rsvp.waitlisted);
  });

  it('does not mutate the source detail', () => {
    const detail = buildPracticeSessionDetail();

    applyOptimisticRsvp(detail, {
      status: RSVP_STATUS.going,
      reasonCategory: null,
      version: 1,
    });

    expect(detail.rsvp.status).toBe(RSVP_STATUS.noResponse);
  });
});
