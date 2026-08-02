import { describe, expect, it, vi } from 'vitest';

import {
  buildPublicCompetitionsLabels,
  buildPublicLeaderboardLabels,
  buildPublicMatchesLabels,
  PUBLIC_SHOWCASE_COPY_KEYS,
} from './public-showcase-copy.helper';

const translate = vi.fn((key: string) => `t(${key})`);

describe('PUBLIC_SHOWCASE_COPY_KEYS', () => {
  it('supplies every designed state the shared copy builder needs', () => {
    expect(Object.keys(PUBLIC_SHOWCASE_COPY_KEYS).sort()).toEqual([
      'errorMessage',
      'errorTitle',
      'forbiddenMessage',
      'forbiddenTitle',
      'loadingLabel',
      'offlineMessage',
      'offlineTitle',
      'retry',
    ]);
  });
});

describe('buildPublicCompetitionsLabels', () => {
  it('translates every card label through the i18n pipeline', () => {
    const labels = buildPublicCompetitionsLabels(translate);

    expect(labels.finishLabel).toBe('t(publicCompetitions.finishLabel)');
    expect(labels.finishPending).toBe('t(publicCompetitions.finishPending)');
    expect(labels.notPublished).toBe('t(publicCompetitions.notPublished)');
    expect(labels.openDetail).toBe('t(publicCompetitions.openDetail)');
  });
});

describe('buildPublicMatchesLabels', () => {
  it('carries a word for every outcome token, pending included', () => {
    const labels = buildPublicMatchesLabels(translate);

    expect(labels.outcomes.win).toBe('t(publicCompetitions.outcomeWin)');
    expect(labels.outcomes.loss).toBe('t(publicCompetitions.outcomeLoss)');
    expect(labels.outcomes.draw).toBe('t(publicCompetitions.outcomeDraw)');
    expect(labels.outcomes.pending).toBe('t(publicCompetitions.outcomePending)');
  });

  it('carries the disclosure copy for the per-match player scores', () => {
    const labels = buildPublicMatchesLabels(translate);

    expect(labels.showPlayers).toBe('t(publicCompetitions.showPlayers)');
    expect(labels.hidePlayers).toBe('t(publicCompetitions.hidePlayers)');
    expect(labels.playersEmpty).toBe('t(publicCompetitions.playersEmpty)');
    expect(labels.columnGoals).toBe('t(publicCompetitions.columnGoals)');
  });
});

describe('buildPublicLeaderboardLabels', () => {
  it('translates the leaderboard column headers and empty copy', () => {
    const labels = buildPublicLeaderboardLabels(translate);

    expect(labels.columnRank).toBe('t(publicCompetitions.columnRank)');
    expect(labels.columnPoints).toBe('t(publicCompetitions.columnPoints)');
    expect(labels.emptyTitle).toBe('t(publicCompetitions.leaderboardEmptyTitle)');
    expect(labels.caption).toBe('t(publicCompetitions.leaderboardCaption)');
  });
});
