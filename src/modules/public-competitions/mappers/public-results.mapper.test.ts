import { describe, expect, it, vi } from 'vitest';

import type {
  PublicLeaderboardEntryDto,
  PublicMatchResultDto,
} from '../types/public-showcase.types';
import {
  resolveTopPoints,
  toPublicLeaderboardRowView,
  toPublicMatchRowView,
} from './public-results.mapper';

const translate = vi.fn((key: string, params?: Record<string, string | number>) =>
  params === undefined
    ? key
    : `${String(params['ours'])}|${String(params['opponent'])}|${String(params['theirs'])}`,
);

function match(overrides: Partial<PublicMatchResultDto> = {}): PublicMatchResultDto {
  return {
    matchId: 'match-1',
    opponentName: 'Cairo Ultimate',
    playedAt: '2026-06-12T15:00:00.000Z',
    ourScore: 8,
    opponentScore: 6,
    playerScores: [],
    ...overrides,
  };
}

function entry(overrides: Partial<PublicLeaderboardEntryDto> = {}): PublicLeaderboardEntryDto {
  return { playerId: 'p1', displayName: 'Sherif Ashraf', rank: 1, points: 40, ...overrides };
}

describe('toPublicMatchRowView', () => {
  it('classifies a higher score as a win and a lower one as a loss', () => {
    expect(toPublicMatchRowView(match(), 'en', translate).outcome).toBe('win');
    expect(
      toPublicMatchRowView(match({ ourScore: 5, opponentScore: 9 }), 'en', translate).outcome,
    ).toBe('loss');
  });

  it('classifies an equal score as a draw, with its own tone', () => {
    const row = toPublicMatchRowView(match({ ourScore: 7, opponentScore: 7 }), 'en', translate);

    expect(row.outcome).toBe('draw');
    expect(row.outcomeTone).toBe('medium');
  });

  it('treats an unscored fixture as pending rather than a nil-all draw', () => {
    const row = toPublicMatchRowView(
      match({ ourScore: null, opponentScore: null }),
      'en',
      translate,
    );

    expect(row.outcome).toBe('pending');
    expect(row.outcomeTone).toBe('warning');
    expect(row.scoreText).toBeNull();
    expect(row.scoreReadout).toBeNull();
  });

  it('treats a half-entered score as pending too', () => {
    expect(toPublicMatchRowView(match({ opponentScore: null }), 'en', translate).outcome).toBe(
      'pending',
    );
  });

  it('wraps the score pair in a bidi isolate so Arabic cannot reverse it', () => {
    const english = toPublicMatchRowView(match(), 'en', translate).scoreText;
    const arabic = toPublicMatchRowView(match(), 'ar', translate).scoreText;

    expect(english).toBe('⁨8 – 6⁩');
    expect(arabic).toBe('⁨8 – 6⁩');
  });

  it('spells the score out per side for assistive tech', () => {
    expect(toPublicMatchRowView(match(), 'en', translate).scoreReadout).toBe('8|Cairo Ultimate|6');
  });

  it('reports an unconfirmed fixture slot as a null date', () => {
    expect(toPublicMatchRowView(match({ playedAt: null }), 'en', translate).dateText).toBeNull();
  });

  it('maps each player line, appending a jersey number when there is one', () => {
    const row = toPublicMatchRowView(
      match({
        playerScores: [
          {
            playerId: 'p1',
            displayName: 'Sherif Ashraf',
            jerseyNumber: '33',
            goals: 3,
            assists: 2,
            blocks: 1,
          },
          {
            playerId: 'p2',
            displayName: 'Rawan Elessawy',
            jerseyNumber: null,
            goals: 1,
            assists: 0,
            blocks: 4,
          },
        ],
      }),
      'en',
      translate,
    );

    expect(row.players[0]?.nameText).toBe('Sherif Ashraf 33');
    expect(row.players[0]?.goalsText).toBe('3');
    expect(row.players[1]?.nameText).toBe('Rawan Elessawy');
    expect(row.players[1]?.blocksText).toBe('4');
  });
});

describe('toPublicLeaderboardRowView', () => {
  it('fills the meter for the leader and scales everyone else against them', () => {
    expect(toPublicLeaderboardRowView(entry(), 40, 'en').barPercent).toBe(100);
    expect(toPublicLeaderboardRowView(entry({ points: 10, rank: 4 }), 40, 'en').barPercent).toBe(
      25,
    );
  });

  it('keeps a zero-point player on the board with an empty meter', () => {
    const row = toPublicLeaderboardRowView(entry({ points: 0, rank: 9 }), 40, 'en');

    expect(row.barPercent).toBe(0);
    expect(row.pointsText).toBe('0');
    expect(row.isLeader).toBe(false);
  });

  it('draws no meter at all when nobody has scored yet', () => {
    expect(toPublicLeaderboardRowView(entry({ points: 0 }), 0, 'en').barPercent).toBe(0);
  });

  it('renders the server rank verbatim rather than re-ranking', () => {
    expect(toPublicLeaderboardRowView(entry({ rank: 7 }), 40, 'en').rankText).toBe('7');
  });
});

describe('resolveTopPoints', () => {
  it('returns the highest total on the board', () => {
    expect(resolveTopPoints([entry({ points: 12 }), entry({ playerId: 'p2', points: 31 })])).toBe(
      31,
    );
  });

  it('returns zero for an empty board', () => {
    expect(resolveTopPoints([])).toBe(0);
  });
});
