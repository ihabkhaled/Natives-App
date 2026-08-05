import type { Drill } from '../types/drills.types';

/** A write reports the drill it produced, so the caller can cache and render it. */
export interface DrillWriteCallbacks {
  readonly onSuccess: (drill: Drill) => void;
  readonly onError: (error: unknown) => void;
}

/** One command plus whether it is in flight. */
export interface DrillMutationView<TVariables> {
  readonly run: (variables: TVariables) => void;
  readonly isRunning: boolean;
}
