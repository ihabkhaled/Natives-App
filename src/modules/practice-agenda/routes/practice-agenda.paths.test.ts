import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import { practiceAgendaPath, practiceAgendaPattern } from './practice-agenda.paths';

describe('practice-agenda paths', () => {
  it('registers under the shared session-scoped pattern', () => {
    expect(practiceAgendaPattern()).toBe(APP_PATHS.practiceAgenda);
  });

  it('resolves the pattern for one session', () => {
    expect(practiceAgendaPath('session-1')).toBe('/practice-sessions/session-1/agenda');
  });

  it('encodes a session id that would otherwise break the path', () => {
    expect(practiceAgendaPath('a/b')).toBe('/practice-sessions/a%2Fb/agenda');
  });
});
