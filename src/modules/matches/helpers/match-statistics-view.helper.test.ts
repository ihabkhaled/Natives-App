import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';
import { buildMatchStatistics } from '@/tests/msw/matches-domain.fixture';

import {
  buildChartBars,
  buildChartRows,
  buildDerivationFacts,
  buildGlossaryFacts,
  buildTeamFacts,
} from './match-statistics-view.helper';

const t = (key: string): string => key;
const TEAM = buildMatchStatistics().team;

function factValue(facts: readonly { key: string; value: string }[], key: string): string {
  return facts.find((fact) => fact.key === key)?.value ?? '';
}

describe('buildTeamFacts', () => {
  it('prints every counted measure', () => {
    const facts = buildTeamFacts(t, TEAM);

    expect(factValue(facts, 'goalsFor')).toBe('15');
    expect(factValue(facts, 'holds')).toBe('9');
    expect(factValue(facts, 'opponentBreaks')).toBe('2');
  });

  it('prints an unmeasured team measure as "not enough data"', () => {
    expect(factValue(buildTeamFacts(t, TEAM), 'opponentErrors')).toBe(
      I18N_KEYS.matchStats.notEnoughData,
    );
  });

  it('computes hold and break rates over the completed points', () => {
    const facts = buildTeamFacts(t, TEAM);

    expect(factValue(facts, 'holdRate')).toBe('43%');
    expect(factValue(facts, 'breakRate')).toBe('29%');
  });

  it('reports a rate over zero completed points as unknown, not 0%', () => {
    const facts = buildTeamFacts(t, { ...TEAM, pointsCompleted: 0 });

    expect(factValue(facts, 'holdRate')).toBe(I18N_KEYS.matchStats.notEnoughData);
  });
});

describe('buildChartBars', () => {
  it('scales every bar against the largest measure', () => {
    const bars = buildChartBars(t, TEAM);

    expect(bars.map((bar) => bar.valueText)).toStrictEqual(['9', '6', '4', '2']);
    expect(bars[0]?.percent).toBe(100);
    expect(bars[3]?.percent).toBe(22);
  });

  it('does not divide by zero on an empty match', () => {
    const bars = buildChartBars(t, {
      ...TEAM,
      holds: 0,
      breaks: 0,
      opponentHolds: 0,
      opponentBreaks: 0,
    });

    expect(bars.every((bar) => bar.percent === 0)).toBe(true);
  });
});

describe('buildChartRows', () => {
  it('mirrors the bars into the accessible table', () => {
    const bars = buildChartBars(t, TEAM);

    expect(buildChartRows(bars)).toStrictEqual(
      bars.map((bar) => ({ key: bar.key, label: bar.label, valueText: bar.valueText })),
    );
  });
});

describe('buildDerivationFacts', () => {
  it('reports the engine, the rule set, and what was recorded', () => {
    const facts = buildDerivationFacts(t, buildMatchStatistics());

    expect(factValue(facts, 'engine')).toBe('stats-engine-1');
    expect(factValue(facts, 'ruleset')).toBe('league-standard v2');
    expect(factValue(facts, 'lineups')).toBe(I18N_KEYS.matchStats.derivationRecorded);
    expect(factValue(facts, 'attribution')).toBe(I18N_KEYS.matchStats.derivationNotRecorded);
  });
});

describe('buildGlossaryFacts', () => {
  it('expands every term the screen uses', () => {
    expect(buildGlossaryFacts(t).map((fact) => fact.key)).toStrictEqual([
      'pointsPlayed',
      'holds',
      'breaks',
      'blocks',
      'throwaways',
      'drops',
    ]);
  });
});
