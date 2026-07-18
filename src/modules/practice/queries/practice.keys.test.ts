import { describe, expect, it } from 'vitest';

import { PRACTICE_SCOPE, PRACTICE_TYPE } from '../constants/practice.constants';
import { practiceQueryKeys } from './practice.keys';

const PARAMS = {
  scope: PRACTICE_SCOPE.upcoming,
  type: PRACTICE_TYPE.practice,
  rsvp: null,
  pageSize: 20,
} as const;

describe('practiceQueryKeys', () => {
  it('roots every key under the practice namespace', () => {
    expect(practiceQueryKeys.all).toEqual(['practice']);
  });

  it('embeds the query params in the sessions key', () => {
    expect(practiceQueryKeys.sessions(PARAMS)).toEqual(['practice', 'sessions', PARAMS]);
  });

  it('builds a stable upcoming key', () => {
    expect(practiceQueryKeys.upcoming()).toEqual(['practice', 'upcoming']);
  });

  it('embeds the session id in the detail key', () => {
    expect(practiceQueryKeys.detail('sess-7')).toEqual(['practice', 'detail', 'sess-7']);
  });
});
