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
    expect(practiceQueryKeys.sessions('team-1', PARAMS)).toEqual([
      'practice',
      'team',
      'team-1',
      'sessions',
      PARAMS,
    ]);
  });

  it('builds a stable upcoming key', () => {
    expect(practiceQueryKeys.upcoming('team-1')).toEqual([
      'practice',
      'team',
      'team-1',
      'upcoming',
    ]);
  });

  it('embeds the session id in the detail key', () => {
    expect(practiceQueryKeys.detail('team-1', 'sess-7')).toEqual([
      'practice',
      'team',
      'team-1',
      'detail',
      'sess-7',
    ]);
  });
});
