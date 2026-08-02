import type { AppTranslation } from '@/packages/i18n';

import { toPublicCompetitionCardView } from '../mappers/public-competition.mapper';
import {
  resolveTopPoints,
  toPublicLeaderboardRowView,
  toPublicMatchRowView,
} from '../mappers/public-results.mapper';
import type { PublicShowcaseSections } from '../types/public-competitions-view.types';
import type { PublicCompetitionDetailDto } from '../types/public-showcase.types';

type Translate = AppTranslation['t'];

/**
 * One competition's payload → the three blocks its page renders. A slug the
 * showcase does not know arrives as `null` and yields an empty set of
 * sections, which the screen presents as its designed not-found state rather
 * than as a page of blank tables.
 */
export function buildPublicShowcaseSections(
  detail: PublicCompetitionDetailDto | null,
  locale: string,
  t: Translate,
): PublicShowcaseSections {
  if (detail === null) {
    return { summary: null, matches: [], leaderboard: [] };
  }
  const topPoints = resolveTopPoints(detail.leaderboard);
  return {
    summary: toPublicCompetitionCardView(detail.competition, locale, t),
    matches: detail.matches.map((match) => toPublicMatchRowView(match, locale, t)),
    leaderboard: detail.leaderboard.map((entry) =>
      toPublicLeaderboardRowView(entry, topPoints, locale),
    ),
  };
}
