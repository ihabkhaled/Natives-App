import { PUBLIC_SHOWCASE_SEED_COMPETITIONS } from '../constants/public-showcase-seed.constants';
import type { PublicCompetitionDetailDto } from '../types/public-showcase.types';

/**
 * TODO(public-showcase-1.8.0): SEAM 2 of 2.
 *
 * Mirrors `GET /public/showcase/competitions/{slug}` (@Public), which returns
 * the competition, its match results with per-match player scores, and the
 * per-competition individual leaderboard. None of that is published yet, so
 * this resolves the seeded competition with empty result collections — the
 * screen then renders its designed "no results yet" states instead of
 * fabricated scores. An unknown slug resolves to `null`, exactly as the real
 * endpoint's 404 will be mapped.
 *
 * Wiring it up is a one-file change: keep this exact signature, replace the
 * body with a gateway `request*` call parsed through a response schema.
 */
export async function getPublicCompetition(
  slug: string,
): Promise<PublicCompetitionDetailDto | null> {
  const competition = PUBLIC_SHOWCASE_SEED_COMPETITIONS.find((entry) => entry.slug === slug);
  return Promise.resolve(
    competition === undefined ? null : { competition, matches: [], leaderboard: [] },
  );
}
