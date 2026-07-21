import { I18N_KEYS } from '@/shared/i18n';

import type { PlayerMatchStatistics } from '../types/matches.types';
import type { PlayerStatRowView } from '../types/matches-view.types';

type Translate = (key: string, params?: Record<string, string | number>) => string;

/** The measures a row prints, in column order. */
const MEASURES = [
  'pointsPlayed',
  'offencePointsPlayed',
  'defencePointsPlayed',
  'goals',
  'assists',
  'drops',
  'throwaways',
  'blocks',
] as const;

/**
 * A measured zero prints "0". A measure the event stream cannot support prints
 * "not enough data". Collapsing the second into the first would report that a
 * player definitely did nothing when the truth is that nobody recorded it.
 */
export function formatStatValue(t: Translate, value: number | null): string {
  return value === null ? t(I18N_KEYS.matchStats.notEnoughData) : String(value);
}

/** True only when every measure is a real, measured zero. */
export function hasNoRecordedContribution(player: PlayerMatchStatistics): boolean {
  return MEASURES.every((measure) => player[measure] === 0);
}

/** True when at least one measure is missing rather than measured. */
export function hasMissingMeasures(player: PlayerMatchStatistics): boolean {
  return MEASURES.some((measure) => player[measure] === null);
}

export function buildPlayerStatCells(
  t: Translate,
  player: PlayerMatchStatistics,
): readonly string[] {
  return MEASURES.map((measure) => formatStatValue(t, player[measure]));
}

/**
 * One table row per player.
 *
 * `resolveName` comes from the member directory; a membership the directory
 * does not resolve keeps its id rather than being dropped, because dropping it
 * would break the roster-completeness guarantee this table exists to make.
 */
export function buildPlayerStatRow(
  t: Translate,
  player: PlayerMatchStatistics,
  resolveName: (membershipId: string) => string,
): PlayerStatRowView {
  const noContribution = hasNoRecordedContribution(player);
  return {
    membershipId: player.membershipId,
    name: resolveName(player.membershipId),
    rosteredLabel: t(
      player.rostered ? I18N_KEYS.matchStats.rosteredBadge : I18N_KEYS.matchStats.unrosteredBadge,
    ),
    isRostered: player.rostered,
    hasNoContribution: noContribution,
    zeroNotice: noContribution ? t(I18N_KEYS.matchStats.zeroContribution) : null,
    cells: buildPlayerStatCells(t, player),
    openLabel: t(I18N_KEYS.matchStats.reportOpen),
  };
}

/**
 * Rostered players first, then anyone the stream recorded who was not on the
 * roster; alphabetical inside each group so the order is deterministic.
 */
export function sortPlayerRows(rows: readonly PlayerStatRowView[]): readonly PlayerStatRowView[] {
  return [...rows].sort((left, right) => {
    if (left.isRostered !== right.isRostered) {
      return left.isRostered ? -1 : 1;
    }
    return left.name.localeCompare(right.name);
  });
}
