import { describe, expect, it } from 'vitest';

import {
  practiceAgendaGroupsPath,
  practiceAgendaGroupsPattern,
} from './practice-agenda-groups.paths';

describe('practice-agenda-groups paths', () => {
  it('exposes the pattern with its parameter unresolved', () => {
    expect(practiceAgendaGroupsPattern()).toBe('/practice-sessions/:sessionId/agenda/groups');
  });

  it('resolves the pattern for one session', () => {
    expect(practiceAgendaGroupsPath('s1')).toBe('/practice-sessions/s1/agenda/groups');
  });

  it('encodes the id so a stray slash cannot invent a route segment', () => {
    expect(practiceAgendaGroupsPath('s/1')).toBe('/practice-sessions/s%2F1/agenda/groups');
  });
});
