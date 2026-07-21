import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';
import { buildMatch } from '@/tests/msw/matches-domain.fixture';

import {
  ALL_MATCH_FILTER,
  buildMatchCard,
  buildMatchStatusOptions,
  isMatchInPlay,
  matchesStatusFilter,
} from './match-list-view.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${JSON.stringify(params)}`;

describe('matchesStatusFilter', () => {
  it('accepts everything under the all filter', () => {
    expect(matchesStatusFilter('live', ALL_MATCH_FILTER)).toBe(true);
  });

  it('accepts only the selected status otherwise', () => {
    expect(matchesStatusFilter('live', 'live')).toBe(true);
    expect(matchesStatusFilter('live', 'finalized')).toBe(false);
  });
});

describe('buildMatchStatusOptions', () => {
  it('offers the all filter first, then every lifecycle state', () => {
    const options = buildMatchStatusOptions(t);

    expect(options[0]).toStrictEqual({
      value: ALL_MATCH_FILTER,
      label: I18N_KEYS.matches.filterAll,
    });
    expect(options).toHaveLength(9);
  });
});

describe('isMatchInPlay', () => {
  it.each([
    ['live', true],
    ['paused', true],
    ['halftime', true],
    ['scheduled', false],
    ['finalized', false],
  ])('reports %s as in play=%s', (status, expected) => {
    expect(isMatchInPlay(status)).toBe(expected);
  });
});

describe('buildMatchCard', () => {
  it('renders the score, the state, and both entry points', () => {
    const card = buildMatchCard(t, buildMatch());

    expect(card.scoreLabel).toBe(`${I18N_KEYS.matches.cardScoreLabel}:{"us":8,"them":6}`);
    expect(card.statusLabel).toBe(I18N_KEYS.matches.statusLive);
    expect(card.statusTone).toBe('success');
    expect(card.isLive).toBe(true);
    expect(card.openScoreboardLabel).toBe(I18N_KEYS.matches.openScoreboard);
    expect(card.openStatisticsLabel).toBe(I18N_KEYS.matches.openStatistics);
  });

  it('renders a finalized result', () => {
    const card = buildMatchCard(t, buildMatch({ status: 'finalized', result: 'win' }));

    expect(card.resultLabel).toBe(I18N_KEYS.matches.resultWin);
    expect(card.isLive).toBe(false);
    expect(card.statusTone).toBe('success');
  });
});
