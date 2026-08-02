/**
 * Tokens the public showcase screens share. Outcome is derived by the mapper
 * from the two scores, never sent as free text, so a missing score can only
 * ever resolve to `pending` — the honest answer for a fixture nobody has
 * played yet.
 */
export const MATCH_OUTCOME = {
  Win: 'win',
  Loss: 'loss',
  Draw: 'draw',
  Pending: 'pending',
} as const;

export type MatchOutcome = (typeof MATCH_OUTCOME)[keyof typeof MATCH_OUTCOME];

/** Ionic colour token per outcome; never a raw hex value. */
export const MATCH_OUTCOME_TONES: Readonly<Record<MatchOutcome, string>> = {
  win: 'success',
  loss: 'danger',
  draw: 'medium',
  pending: 'warning',
};

/**
 * `false` while the public showcase endpoints (contract 1.8.0) are still
 * being built: the screens render the real competitions we entered and say
 * plainly that live results are not connected yet. Flipping this to `true`
 * is the last step of the wire-up, after the two service files stop reading
 * the seed and start calling the gateway.
 */
export const PUBLIC_SHOWCASE_LIVE = false;

/** Named route parameter for the public competition detail screen. */
export const COMPETITION_SLUG_PARAM = 'competitionSlug';

/** The leaderboard meter is a percentage of the leader's points. */
export const LEADERBOARD_BAR_MAX_PERCENT = 100;
