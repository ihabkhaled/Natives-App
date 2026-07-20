import type {
  CandidateDetail,
  DecideCandidateCommand,
  RegisterCandidateCommand,
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
