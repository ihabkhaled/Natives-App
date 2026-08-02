import { formatCairoDate } from '@/packages/date';
import type { AppTranslation } from '@/packages/i18n';
import { formatNumber, formatScorePair } from '@/packages/number';
import { I18N_KEYS } from '@/shared/i18n';

import {
  LEADERBOARD_BAR_MAX_PERCENT,
  MATCH_OUTCOME,
  MATCH_OUTCOME_TONES,
  type MatchOutcome,
} from '../constants/public-showcase.constants';
import type {
  PublicLeaderboardRowView,
  PublicMatchRowView,
  PublicPlayerScoreRowView,
} from '../types/public-competitions-view.types';
import type {
  PublicLeaderboardEntryDto,
  PublicMatchResultDto,
  PublicPlayerScoreDto,
} from '../types/public-showcase.types';

type Translate = AppTranslation['t'];

/** A fixture with no score yet is `pending`, never a 0–0 draw. */
function resolveOutcome(ourScore: number | null, opponentScore: number | null): MatchOutcome {
  if (ourScore === null || opponentScore === null) {
    return MATCH_OUTCOME.Pending;
  }
  if (ourScore > opponentScore) {
    return MATCH_OUTCOME.Win;
  }
  return ourScore < opponentScore ? MATCH_OUTCOME.Loss : MATCH_OUTCOME.Draw;
}

function toPlayerRow(dto: PublicPlayerScoreDto, locale: string): PublicPlayerScoreRowView {
  const jersey = dto.jerseyNumber === null ? '' : ` ${formatNumber(dto.jerseyNumber, locale)}`;
  return {
    key: dto.playerId,
    nameText: `${dto.displayName}${jersey}`,
    goalsText: formatNumber(dto.goals, locale),
    assistsText: formatNumber(dto.assists, locale),
    blocksText: formatNumber(dto.blocks, locale),
  };
}

/**
 * The two score renderings, or nulls before the match is scored.
 *
 * The visible pair goes through `formatScorePair` from `@/packages/number`,
 * which wraps `8 – 6` in a bidi isolate: without it the neutral dash resolves
 * right-to-left inside an Arabic paragraph and the line renders as `6 – 8`,
 * silently reversing who won. The readout is the word-per-side alternative
 * assistive tech announces, so nobody has to infer a result from a dash.
 */
function toScoreFields(
  dto: PublicMatchResultDto,
  locale: string,
  t: Translate,
): Pick<PublicMatchRowView, 'scoreText' | 'scoreReadout'> {
  const { ourScore, opponentScore } = dto;
  if (ourScore === null || opponentScore === null) {
    return { scoreText: null, scoreReadout: null };
  }
  return {
    scoreText: formatScorePair(ourScore, opponentScore, locale),
    scoreReadout: t(I18N_KEYS.publicCompetitions.scoreReadout, {
      ours: formatNumber(ourScore, locale),
      opponent: dto.opponentName,
      theirs: formatNumber(opponentScore, locale),
    }),
  };
}

/** Match result → table row. */
export function toPublicMatchRowView(
  dto: PublicMatchResultDto,
  locale: string,
  t: Translate,
): PublicMatchRowView {
  const outcome = resolveOutcome(dto.ourScore, dto.opponentScore);
  return {
    key: dto.matchId,
    opponentName: dto.opponentName,
    dateText: dto.playedAt === null ? null : formatCairoDate(dto.playedAt, locale),
    ...toScoreFields(dto, locale, t),
    outcome,
    outcomeTone: MATCH_OUTCOME_TONES[outcome],
    players: dto.playerScores.map((player) => toPlayerRow(player, locale)),
  };
}

/**
 * Leaderboard entry → table row. The meter is a share of the leader's total,
 * so the top row always fills the track and a zero-point player still gets a
 * row — never dropped, never hidden. The server's rank is rendered as-is; the
 * client never re-ranks.
 */
export function toPublicLeaderboardRowView(
  dto: PublicLeaderboardEntryDto,
  topPoints: number,
  locale: string,
): PublicLeaderboardRowView {
  const share = topPoints <= 0 ? 0 : (dto.points / topPoints) * LEADERBOARD_BAR_MAX_PERCENT;
  return {
    key: dto.playerId,
    rankText: formatNumber(dto.rank, locale),
    displayName: dto.displayName,
    pointsText: formatNumber(dto.points, locale),
    barPercent: Math.max(0, Math.round(share)),
    isLeader: dto.rank === 1,
  };
}

/** The highest points total on a board, or 0 for an empty one. */
export function resolveTopPoints(entries: readonly PublicLeaderboardEntryDto[]): number {
  return entries.reduce((top, entry) => Math.max(top, entry.points), 0);
}
