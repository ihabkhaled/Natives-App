/**
 * Vocabularies for the staff review of tryout candidates, taken verbatim from
 * the `TryoutCandidateResponseDto` enums in `contracts/openapi.json`.
 *
 * They deliberately do NOT reuse `@/modules/tryouts`: that module speaks the
 * older per-event contract whose candidate statuses are `evaluated`/`declined`,
 * where this contract has `no_show`/`rejected`. Sharing one union would let a
 * status the server can actually send fall through an exhaustive map.
 */

/** One page of the review queue. Small on purpose: staff triage, not browse. */
export const TRYOUT_CANDIDATE_PAGE_SIZE = 25;

export const TRYOUT_CANDIDATE_STATUSES = [
  'registered',
  'waitlisted',
  'checked_in',
  'no_show',
  'withdrawn',
  'accepted',
  'rejected',
  'converted',
] as const;

/** Self-reported physical readiness. Only ever read with the readiness grant. */
export const TRYOUT_CANDIDATE_READINESS_LEVELS = [
  'ready',
  'limited',
  'injured',
  'unknown',
] as const;

/** How the candidate asked to be reached. Only ever read with the contacts grant. */
export const TRYOUT_CANDIDATE_CONTACT_CHANNELS = ['email', 'phone', 'whatsapp', 'none'] as const;

/**
 * The statuses a withdrawal still means something for. A candidate who already
 * withdrew, was rejected, no-showed, or converted has left the funnel, so the
 * affordance is absent rather than disabled — offering it would imply the
 * record can still be changed.
 */
export const WITHDRAWABLE_CANDIDATE_STATUSES = [
  'registered',
  'waitlisted',
  'checked_in',
  'accepted',
] as const;

/**
 * The written reason a withdrawal is recorded with. The contract's floor is 3
 * characters; this client asks for 5 because 5 is the number the only
 * validation sentence in the catalog actually states. A stricter client bound
 * with honest copy beats a looser one with a lie.
 */
export const WITHDRAWAL_REASON_MIN_LENGTH = 5;

/** The contract's own ceiling; the field stops accepting input at it. */
export const WITHDRAWAL_REASON_MAX_LENGTH = 1000;

/** The two blocks the backend withholds independently, one per read grant. */
export const CANDIDATE_DISCLOSURE_BLOCKS = ['contacts', 'readiness'] as const;
