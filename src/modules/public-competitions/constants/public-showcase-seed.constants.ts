import type { PublicCompetitionSummaryDto } from '../types/public-showcase.types';

/**
 * The seam's stand-in for `GET /public/showcase/competitions`.
 *
 * These are the two competitions the team actually entered (per the
 * landing-site spec). Everything the spec does NOT state is `null` on
 * purpose: the final ranks, the field sizes, the venues, the formats, and
 * the dates have not been supplied, and a public results page that invents
 * them would be lying to visitors. `rank === null` is what drives the
 * designed "Results pending" state — the page says it does not know yet
 * rather than showing a placeholder that reads like a result.
 *
 * Match results and leaderboards are deliberately empty for the same reason;
 * the detail screen renders its designed empty states until the backend
 * publishes real ones.
 */
export const PUBLIC_SHOWCASE_SEED_COMPETITIONS: readonly PublicCompetitionSummaryDto[] = [
  {
    slug: 'eunc-2026',
    name: 'EUNC 2026',
    year: 2026,
    format: null,
    location: null,
    startDate: null,
    endDate: null,
    rank: null,
    entrantCount: null,
  },
  {
    slug: 'eudl-2026',
    name: 'EUDL 2026',
    year: 2026,
    format: null,
    location: null,
    startDate: null,
    endDate: null,
    rank: null,
    entrantCount: null,
  },
];
