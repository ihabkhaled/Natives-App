import { describe, expect, it, vi } from 'vitest';

import { buildPracticeAgendaQueryOptions } from './practice-agenda.query';
import { practiceAgendaQueryKeys } from './practice-agenda.keys';

vi.mock('../services/get-practice-agenda.service', () => ({
  getPracticeAgenda: vi.fn().mockResolvedValue({ blocks: [] }),
}));

describe('buildPracticeAgendaQueryOptions', () => {
  it('keys the read by team and session', () => {
    expect(buildPracticeAgendaQueryOptions('t1', 's1').queryKey).toEqual(
      practiceAgendaQueryKeys.agenda('t1', 's1'),
    );
  });

  it('reads the plan for the session it was given', async () => {
    const { getPracticeAgenda } = await import('../services/get-practice-agenda.service');
    await buildPracticeAgendaQueryOptions('t1', 's1').queryFn();

    expect(getPracticeAgenda).toHaveBeenCalledWith({ teamId: 't1', sessionId: 's1' });
  });

  it('stays disabled without a session id, rather than reading a malformed path', () => {
    expect(buildPracticeAgendaQueryOptions('t1', '').enabled).toBe(false);
    expect(buildPracticeAgendaQueryOptions('t1', 's1').enabled).toBe(true);
  });
});

describe('practiceAgendaQueryKeys', () => {
  it('scopes the plan under its team, so two teams cannot share a session cache', () => {
    expect(practiceAgendaQueryKeys.agenda('t1', 's1')).toEqual([
      'practice-agenda',
      'team',
      't1',
      'agenda',
      's1',
    ]);
    expect(practiceAgendaQueryKeys.all).toEqual(['practice-agenda']);
  });
});
