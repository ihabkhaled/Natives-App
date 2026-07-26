import { describe, expect, it } from 'vitest';

import { ACHIEVEMENT_STATUSES } from '../constants/standings.constants';
import {
  allowedTransitionsFor,
  transitionCollectsReason,
  transitionNeedsConfirm,
} from './achievement-transition.helper';

/**
 * The UI mirror of the backend achievement state machine. A property this test
 * pins: the actions offered for a status are exactly the backend-allowed ones,
 * and terminal states offer nothing.
 */
describe('allowedTransitionsFor', () => {
  it('maps each status to its state-machine transitions', () => {
    expect(allowedTransitionsFor('draft')).toEqual(['submit']);
    expect(allowedTransitionsFor('submitted')).toEqual(['approve', 'reject']);
    expect(allowedTransitionsFor('approved')).toEqual(['archive']);
  });

  it('offers no transition from a terminal state', () => {
    expect(allowedTransitionsFor('rejected')).toEqual([]);
    expect(allowedTransitionsFor('archived')).toEqual([]);
  });

  it('covers every status in the vocabulary', () => {
    for (const status of ACHIEVEMENT_STATUSES) {
      expect(Array.isArray(allowedTransitionsFor(status))).toBe(true);
    }
  });
});

describe('transitionNeedsConfirm', () => {
  it('confirms every transition except the low-stakes submit', () => {
    expect(transitionNeedsConfirm('submit')).toBe(false);
    expect(transitionNeedsConfirm('approve')).toBe(true);
    expect(transitionNeedsConfirm('reject')).toBe(true);
    expect(transitionNeedsConfirm('archive')).toBe(true);
  });
});

describe('transitionCollectsReason', () => {
  it('collects a reason only for the terminal rejection', () => {
    expect(transitionCollectsReason('reject')).toBe(true);
    expect(transitionCollectsReason('approve')).toBe(false);
    expect(transitionCollectsReason('submit')).toBe(false);
    expect(transitionCollectsReason('archive')).toBe(false);
  });
});
