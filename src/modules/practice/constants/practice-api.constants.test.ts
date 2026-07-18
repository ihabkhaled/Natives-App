import { describe, expect, it } from 'vitest';

import {
  PRACTICE_API_PATHS,
  practiceRsvpPath,
  practiceSessionDetailPath,
  practiceSessionsPath,
} from './practice-api.constants';

describe('PRACTICE_API_PATHS', () => {
  it('pins the team collection root', () => {
    expect(PRACTICE_API_PATHS.teams).toBe('/teams');
  });
});

describe('practiceSessionsPath', () => {
  it('builds and encodes the team-scoped calendar endpoint', () => {
    expect(practiceSessionsPath('team/one')).toBe('/teams/team%2Fone/practice-sessions');
  });
});

describe('practiceSessionDetailPath', () => {
  it('appends the session id', () => {
    expect(practiceSessionDetailPath('team-1', 'sess-7')).toBe(
      '/teams/team-1/practice-sessions/sess-7',
    );
  });

  it('encodes an unsafe id', () => {
    expect(practiceSessionDetailPath('team/1', 'a b')).toBe(
      '/teams/team%2F1/practice-sessions/a%20b',
    );
  });
});

describe('practiceRsvpPath', () => {
  it('targets the self-RSVP sub-resource', () => {
    expect(practiceRsvpPath('team-1', 'sess-7')).toBe(
      '/teams/team-1/practice-sessions/sess-7/rsvp',
    );
  });
});
