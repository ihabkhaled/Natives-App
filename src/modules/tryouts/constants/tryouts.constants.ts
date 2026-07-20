/**
 * Tryout vocabularies. The backend tryouts module (prompts 600/601) is not
 * deployed yet, so these values are the contract this client is written
 * against and the one the MSW handlers implement; see
 * docs/api-verification.md.
 */
export const TRYOUT_EVENT_STATUSES = ['scheduled', 'open', 'closed', 'completed'] as const;

export type TryoutEventStatus = (typeof TRYOUT_EVENT_STATUSES)[number];

export const CANDIDATE_STATUSES = [
  'registered',
  'waitlisted',
  'checked_in',
  'evaluated',
  'accepted',
  'declined',
  'withdrawn',
  'converted',
] as const;

export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number];

export const EVALUATION_CRITERIA = ['throwing', 'catching', 'movement', 'attitude'] as const;

export type EvaluationCriterion = (typeof EVALUATION_CRITERIA)[number];

export const DECISION_OUTCOMES = ['accept', 'waitlist', 'decline'] as const;

export type DecisionOutcome = (typeof DECISION_OUTCOMES)[number];

export const REGISTRATION_OUTCOMES = ['registered', 'waitlisted', 'duplicate'] as const;

export type RegistrationOutcome = (typeof REGISTRATION_OUTCOMES)[number];

/** Bounded paging and the validation limits the UI mirrors from the contract. */
export const TRYOUT_LIMITS = {
  pageSize: 50,
  candidatePageSize: 100,
  reasonMin: 5,
  reasonMax: 500,
  scoreMin: 1,
  scoreMax: 5,
  earliestBirthYear: 1900,
  latestBirthYear: 2100,
} as const;

/** The consent text version stored with every registration for audit. */
export const CONSENT_VERSION = 'tryout-consent-v1';

/** Sentinel for the "no candidate-status filter" option. */
export const ALL_CANDIDATES_FILTER = 'all';
