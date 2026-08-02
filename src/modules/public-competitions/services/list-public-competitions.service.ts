import { PUBLIC_SHOWCASE_SEED_COMPETITIONS } from '../constants/public-showcase-seed.constants';
import type { PublicCompetitionSummaryDto } from '../types/public-showcase.types';

/**
 * TODO(public-showcase-1.8.0): SEAM 1 of 2.
 *
 * The public read model (`GET /public/showcase/competitions`, @Public,
 * bounded publishable fields only) is being built right now and is not in
 * this repo's generated contract yet. Inventing a gateway call to a route
 * that does not exist would 404 for every visitor, so this resolves the
 * seeded competitions locally and makes no network request at all.
 *
 * Wiring it up is a one-file change: keep this exact signature, replace the
 * body with a gateway `request*` call parsed through a response schema, and
 * flip `PUBLIC_SHOWCASE_LIVE`. The query, mappers, hooks, and screens need
 * no changes — they already speak `PublicCompetitionSummaryDto`.
 */
export async function listPublicCompetitions(): Promise<readonly PublicCompetitionSummaryDto[]> {
  return Promise.resolve(PUBLIC_SHOWCASE_SEED_COMPETITIONS);
}
