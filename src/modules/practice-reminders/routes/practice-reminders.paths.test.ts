import { describe, expect, it } from 'vitest';

import { practiceRemindersPath, practiceRemindersPattern } from './practice-reminders.paths';

describe('practice-reminders paths', () => {
  it('exposes the pattern with its parameter unresolved', () => {
    expect(practiceRemindersPattern()).toBe('/practice-sessions/:sessionId/reminders');
  });

  it('resolves the pattern for one session', () => {
    expect(practiceRemindersPath('s1')).toBe('/practice-sessions/s1/reminders');
  });

  it('encodes the id so a stray slash cannot invent a route segment', () => {
    expect(practiceRemindersPath('s/1')).toBe('/practice-sessions/s%2F1/reminders');
  });
});
