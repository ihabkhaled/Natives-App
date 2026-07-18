import { describe, expect, it } from 'vitest';

import {
  PRACTICE_CHANGE_LABEL_KEYS,
  PRACTICE_SCOPE_LABEL_KEYS,
  PRACTICE_SCOPE_OPTIONS,
  PRACTICE_STATUS_LABEL_KEYS,
  PRACTICE_TYPE,
  PRACTICE_TYPE_LABEL_KEYS,
  PRACTICE_TYPE_OPTIONS,
  RSVP_FILTER_OPTIONS,
  RSVP_REASON_LABEL_KEYS,
  RSVP_REASON_OPTIONS,
  RSVP_STATUS,
  RSVP_STATUS_LABEL_KEYS,
} from './practice.constants';

describe('practice vocabularies', () => {
  it('maps every practice type to a namespaced i18n key', () => {
    for (const type of Object.values(PRACTICE_TYPE)) {
      expect(PRACTICE_TYPE_LABEL_KEYS[type].startsWith('practice.')).toBe(true);
    }
  });

  it('maps every RSVP status to a label key', () => {
    for (const status of Object.values(RSVP_STATUS)) {
      expect(RSVP_STATUS_LABEL_KEYS[status].startsWith('practice.')).toBe(true);
    }
  });

  it('offers every type in the filter options', () => {
    expect(new Set(PRACTICE_TYPE_OPTIONS)).toEqual(new Set(Object.values(PRACTICE_TYPE)));
  });

  it('scopes cover upcoming, all, and past', () => {
    expect(PRACTICE_SCOPE_OPTIONS).toHaveLength(3);
    for (const scope of PRACTICE_SCOPE_OPTIONS) {
      expect(typeof PRACTICE_SCOPE_LABEL_KEYS[scope]).toBe('string');
    }
  });

  it('offers the answered statuses plus no-response as RSVP filters', () => {
    expect(RSVP_FILTER_OPTIONS).toContain(RSVP_STATUS.going);
    expect(RSVP_FILTER_OPTIONS).toContain(RSVP_STATUS.noResponse);
  });

  it('maps every reason and status and change kind to a key', () => {
    for (const reason of RSVP_REASON_OPTIONS) {
      expect(RSVP_REASON_LABEL_KEYS[reason].startsWith('practice.reason')).toBe(true);
    }
    expect(Object.keys(PRACTICE_STATUS_LABEL_KEYS)).toHaveLength(3);
    expect(Object.keys(PRACTICE_CHANGE_LABEL_KEYS)).toHaveLength(3);
  });
});
