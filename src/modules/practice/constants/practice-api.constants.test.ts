import { describe, expect, it } from 'vitest';

import {
  PRACTICE_API_PATHS,
  practiceRsvpPath,
  practiceSessionDetailPath,
} from './practice-api.constants';

describe('PRACTICE_API_PATHS', () => {
  it('pins the calendar endpoints', () => {
    expect(PRACTICE_API_PATHS.sessions).toBe('/practices/sessions');
    expect(PRACTICE_API_PATHS.upcoming).toBe('/practices/sessions/upcoming');
  });
});

describe('practiceSessionDetailPath', () => {
  it('appends the session id', () => {
    expect(practiceSessionDetailPath('sess-7')).toBe('/practices/sessions/sess-7');
  });

  it('encodes an unsafe id', () => {
    expect(practiceSessionDetailPath('a b')).toBe('/practices/sessions/a%20b');
  });
});

describe('practiceRsvpPath', () => {
  it('targets the self-RSVP sub-resource', () => {
    expect(practiceRsvpPath('sess-7')).toBe('/practices/sessions/sess-7/rsvp');
  });
});
