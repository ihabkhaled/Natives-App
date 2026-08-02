import type {
  CandidateDetail,
  DecideCandidateCommand,
  RegisterCandidateCommand,
  RegistrationResult,
  SaveEvaluationCommand,
} from './tryouts.types';

export interface TryoutsMutationCallbacks {
  readonly onSuccess: () => void;
  readonly onError: () => void;
}

export interface RegisterMutationView {
  readonly run: (command: RegisterCandidateCommand) => void;
  readonly isRunning: boolean;
}

/**
 * Registration reports its two outcomes separately: a server answer (which
 * may itself be a duplicate or a waitlist placement) and a failed call, which
 * must never be presented as a silent success.
 */
export interface RegisterMutationCallbacks {
  readonly onResult: (result: RegistrationResult) => void;
  readonly onFailure: () => void;
}

/** A mutation keyed only by candidate id: check-in and conversion. */
export interface CandidateActionView {
  readonly run: (candidateId: string) => void;
  readonly isRunning: boolean;
}

export interface EvaluationMutationView {
  readonly run: (command: SaveEvaluationCommand) => void;
  readonly isRunning: boolean;
}

export interface DecisionMutationView {
  readonly run: (command: DecideCandidateCommand) => void;
  readonly isRunning: boolean;
}

/** What every candidate-panel sub-hook needs: scope, record, and one grant. */
export interface CandidatePanelInput {
  readonly teamId: string;
  readonly tryoutId: string;
  readonly detail: CandidateDetail | null;
  readonly isPermitted: boolean;
}
