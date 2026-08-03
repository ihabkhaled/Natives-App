import type { PublicCompetitionDetailDto } from '../types/public-showcase.types';
import { listPublicCompetitions } from './list-public-competitions.service';

/**
 * One competition, resolved from the same public directory read as the list.
 *
 * Match results and the per-competition leaderboard stay empty: neither is
 * recorded anywhere yet, so the screen renders its designed "no results yet"
 * states rather than fabricated scores. An unknown slug resolves to null,
 * which the screen presents as its not-found state.
 */
export async function getPublicCompetition(
  slug: string,
): Promise<PublicCompetitionDetailDto | null> {
  const competitions = await listPublicCompetitions();
  const competition = competitions.find((entry) => entry.slug === slug);

  return competition === undefined ? null : { competition, matches: [], leaderboard: [] };
}
