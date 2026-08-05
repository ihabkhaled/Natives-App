import { describe, expect, it } from 'vitest';

import { describeDispatch, describeTest } from './reminder-outcome.helper';

const DISPATCH_KEYS = {
  nothingDue: 'nothingDue',
  sent: 'sent',
  heldBack: 'heldBack',
} as const;

const TEST_KEYS = {
  queued: 'queued',
  quietHours: 'quietHours',
  failed: 'failed',
} as const;

describe('describeDispatch', () => {
  /**
   * "Queued 0 of 0" reads like a failure the coach caused. Nothing being due
   * is a normal state and is said as one.
   */
  it('says nothing was due rather than reporting zero of zero', () => {
    expect(describeDispatch({ candidates: 0, enqueued: 0 }, DISPATCH_KEYS)).toEqual([
      { key: 'nothingDue', params: {} },
    ]);
  });

  it('reports the queued count against the candidate count', () => {
    expect(describeDispatch({ candidates: 15, enqueued: 15 }, DISPATCH_KEYS)).toEqual([
      { key: 'sent', params: { enqueued: 15, candidates: 15 } },
    ]);
  });

  /**
   * The difference between 15 sent and 12 sent is the whole point of returning
   * both numbers; naming it saves the coach doing the subtraction.
   */
  it('names how many were held back when the two counts differ', () => {
    expect(describeDispatch({ candidates: 15, enqueued: 12 }, DISPATCH_KEYS)).toEqual([
      { key: 'sent', params: { enqueued: 12, candidates: 15 } },
      { key: 'heldBack', params: { count: 3 } },
    ]);
  });
});

describe('describeTest', () => {
  it('confirms a queued self-test', () => {
    expect(describeTest({ enqueued: true, reason: null }, TEST_KEYS)).toBe('queued');
  });

  /**
   * Quiet hours are the member's own preference. A refusal there is the system
   * honouring it, so it is reported as an outcome rather than a failure.
   */
  it('explains a quiet-hours refusal instead of calling it a failure', () => {
    expect(describeTest({ enqueued: false, reason: 'quiet_hours' }, TEST_KEYS)).toBe('quietHours');
  });

  it('falls back to a failure when the refusal has no known reason', () => {
    expect(describeTest({ enqueued: false, reason: null }, TEST_KEYS)).toBe('failed');
  });
});
