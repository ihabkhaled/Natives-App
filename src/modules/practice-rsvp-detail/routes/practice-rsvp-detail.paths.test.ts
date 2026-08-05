import { describe, expect, it } from 'vitest';

import { practiceRsvpDetailPath, practiceRsvpDetailPattern } from './practice-rsvp-detail.paths';

describe('practice-rsvp-detail paths', () => {
  it('exposes the pattern with its parameter unresolved', () => {
    expect(practiceRsvpDetailPattern()).toBe('/practice-sessions/:sessionId/rsvps');
  });

  it('resolves the pattern for one session', () => {
    expect(practiceRsvpDetailPath('s1')).toBe('/practice-sessions/s1/rsvps');
  });

  it('encodes the id so a stray slash cannot invent a route segment', () => {
    expect(practiceRsvpDetailPath('s/1')).toBe('/practice-sessions/s%2F1/rsvps');
  });
});
