import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import {
  PRACTICE_SESSION_ID_PARAM,
  practiceSessionPath,
  practiceSessionPattern,
  practicesPath,
} from './practice.paths';

describe('practice paths', () => {
  it('exposes the list route', () => {
    expect(practicesPath()).toBe(APP_PATHS.practices);
  });

  it('exposes the parameterised detail pattern', () => {
    expect(practiceSessionPattern()).toBe(APP_PATHS.practiceSession);
  });

  it('builds a concrete detail path from a session id', () => {
    expect(practiceSessionPath('sess-7')).toBe('/practices/sess-7');
  });

  it('encodes an unsafe session id', () => {
    expect(practiceSessionPath('a/b')).toBe('/practices/a%2Fb');
  });

  it('names the id parameter without a colon', () => {
    expect(PRACTICE_SESSION_ID_PARAM).toBe('sessionId');
  });
});
