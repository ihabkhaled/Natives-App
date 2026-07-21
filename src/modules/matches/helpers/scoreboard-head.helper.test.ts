import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';
import { buildMatchRuleset, buildScoreboard } from '@/tests/msw/matches-domain.fixture';

import { buildScoreboardHead } from './scoreboard-head.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${JSON.stringify(params)}`;

describe('buildScoreboardHead', () => {
  it('shows the server score, never a locally incremented counter', () => {
    const head = buildScoreboardHead(t, buildScoreboard(), buildMatchRuleset());

    expect(head.ourScore).toBe('8');
    expect(head.theirScore).toBe('6');
    expect(head.statusLabel).toBe(I18N_KEYS.matches.statusLive);
    expect(head.statusTone).toBe('success');
  });

  it('announces the spoken score once, with the state', () => {
    const head = buildScoreboardHead(t, buildScoreboard(), buildMatchRuleset());

    expect(head.announcement).toBe(
      `${I18N_KEYS.scoreboard.scoreAnnouncement}:{"us":8,"them":6,"status":"${I18N_KEYS.matches.statusLive}"}`,
    );
  });

  it('takes the period count from the rule set when it is loaded', () => {
    const head = buildScoreboardHead(t, buildScoreboard(), buildMatchRuleset({ periods: 2 }));

    expect(head.periodLabel).toBe(`${I18N_KEYS.scoreboard.periodLabel}:{"period":1,"periods":2}`);
  });

  it('falls back to the current period while no rule set is loaded', () => {
    const head = buildScoreboardHead(t, buildScoreboard({ period: 2 }), null);

    expect(head.periodLabel).toBe(`${I18N_KEYS.scoreboard.periodLabel}:{"period":2,"periods":2}`);
  });

  it('names the applied cap', () => {
    const head = buildScoreboardHead(t, buildScoreboard({ capApplied: 'hard' }), null);

    expect(head.capValue).toBe(I18N_KEYS.scoreboard.capHard);
  });
});
