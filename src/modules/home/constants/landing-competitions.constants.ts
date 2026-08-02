/**
 * Competitions the team entered this season (see
 * recovery-audit/specs/landing-site-and-team-directory.md). Ranks and scores
 * are NOT seeded here — they were not supplied and are not invented; the
 * showcase seam (`helpers/landing-competitive-seam.helper.ts`) renders each
 * as "results pending" until the public standings endpoint ships.
 */
export interface LandingCompetition {
  readonly id: string;
  readonly name: string;
  readonly season: string;
}

export const LANDING_COMPETITIONS: readonly LandingCompetition[] = [
  { id: 'eunc-2026', name: 'EUNC', season: '2026' },
  { id: 'eudl-2026', name: 'EUDL', season: '2026' },
] as const;
