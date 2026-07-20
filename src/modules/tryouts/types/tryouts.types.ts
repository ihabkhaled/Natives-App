import type {
  CandidateStatus,
  DecisionOutcome,
  EvaluationCriterion,
  RegistrationOutcome,
  TryoutEventStatus,
} from '../constants/tryouts.constants';

export interface TryoutEvent {
  readonly tryoutId: string;
  readonly name: string;
  readonly status: TryoutEventStatus;
  readonly heldAt: string;
  readonly venueName: string | null;
  readonly capacity: number;
  readonly registeredCount: number;
  readonly waitlistedCount: number;
  readonly consentVersion: string;
}

export interface TryoutEventPage {
  readonly items: readonly TryoutEvent[];
  readonly total: number;
}

/**
 * The candidate row a staff list renders. It deliberately carries no contact
 * detail and no readiness note: those cannot leak through a list because the
 * type has nowhere to put them.
 */
export interface CandidateSummary {
  readonly candidateId: string;
  readonly reference: string;
  readonly displayName: string;
  readonly status: CandidateStatus;
  readonly checkedInAt: string | null;
  readonly evaluationCount: number;
}

export interface CandidatePage {
  readonly items: readonly CandidateSummary[];
  readonly total: number;
}

interface CandidateContacts {
  readonly email: string;
  readonly phone: string | null;
}

interface CandidateReadiness {
  readonly note: string | null;
  readonly recordedAt: string | null;
}

/** A criterion nobody scored stays null; it is never coerced to zero. */
export interface EvaluationScore {
  readonly criterion: EvaluationCriterion;
  readonly score: number | null;
}

interface CandidateDecision {
  readonly outcome: DecisionOutcome;
  readonly reason: string | null;
  readonly decidedAt: string;
  readonly offerExpiresAt: string | null;
}

export interface CandidateDetail {
  readonly summary: CandidateSummary;
  readonly consentVersion: string;
  readonly consentedAt: string;
  readonly birthYear: number | null;
  /** Null when the caller does not hold `tryout.contacts.read`. */
  readonly contacts: CandidateContacts | null;
  /** Null when the caller does not hold `tryout.readiness.read`. */
  readonly readiness: CandidateReadiness | null;
  readonly scores: readonly EvaluationScore[];
  readonly evaluationNote: string | null;
  readonly decision: CandidateDecision | null;
  readonly convertedMembershipId: string | null;
  readonly existingAccount: boolean;
}

export interface RegistrationResult {
  readonly outcome: RegistrationOutcome;
  readonly reference: string | null;
  readonly consentVersion: string;
}

export interface ConversionResult {
  readonly membershipId: string;
  readonly alreadyConverted: boolean;
}

/** Commands. Consent is explicit and travels with its version and timestamp. */
export interface RegisterCandidateCommand {
  readonly tryoutId: string;
  readonly fullName: string;
  readonly preferredName: string | null;
  readonly email: string;
  readonly phone: string | null;
  readonly birthYear: number | null;
  readonly consentVersion: string;
  readonly consentGiven: boolean;
}

export interface SaveEvaluationCommand {
  readonly candidateId: string;
  readonly scores: readonly EvaluationScore[];
  readonly note: string | null;
}

export interface DecideCandidateCommand {
  readonly candidateId: string;
  readonly outcome: DecisionOutcome;
  readonly reason: string;
}
