import { requestPublicTeamDirectory, TEAM_DIRECTORY_SLUG } from '@/modules/team-directory';

import { toCompetitionSlug } from '../mappers/public-competition-slug.mapper';
import type { PublicCompetitionSummaryDto } from '../types/public-showcase.types';

/**
 * The competitions the team has entered, from the public team directory — the
 * same read the landing page and `/team` use, so an admin publishing a
 * competition sees it here without a release.
 *
 * Everything the directory does not carry stays null on purpose: the final
 * ranks, formats, venues and field sizes are recorded nowhere yet, and a
 * results page that invented them would be lying to visitors. `rank === null`
 * is what drives the designed "Results pending" state.
 */
export async function listPublicCompetitions(): Promise<readonly PublicCompetitionSummaryDto[]> {
  const directory = await requestPublicTeamDirectory(TEAM_DIRECTORY_SLUG);

  return directory.competitions.map((competition) => ({
    slug: toCompetitionSlug(competition.name),
    name: competition.name,
    year: resolveYear(competition.startsOn, competition.seasonName),
    format: null,
    location: null,
    startDate: competition.startsOn,
    endDate: competition.endsOn,
    rank: null,
    entrantCount: null,
  }));
}

/**
 * The year the competition ran. Prefers its own start date; falls back to the
 * four digits in the season label ("Season 2026"), which is the only other
 * place the year is recorded.
 */
function resolveYear(startsOn: string | null, seasonName: string): number {
  const fromDate = startsOn === null ? Number.NaN : Number.parseInt(startsOn.slice(0, 4), 10);
  if (!Number.isNaN(fromDate)) {
    return fromDate;
  }
  const fromSeason = /\d{4}/u.exec(seasonName);
  return fromSeason === null ? 0 : Number.parseInt(fromSeason[0], 10);
}
