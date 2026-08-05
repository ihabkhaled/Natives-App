import type { GenerationResult, PracticeSchedule } from '../types/practice-schedules.types';

/** Which team, and possibly which schedule, a mutation acts on. */
export interface ScheduleMutationScope {
  readonly teamId: string;
  readonly scheduleId: string;
}

/** A command with no variables, plus whether it is in flight. */
export interface ScheduleMutationView {
  readonly run: () => void;
  readonly isRunning: boolean;
}

/** The create mutation reports what it made, so the screen can redirect to it. */
export interface ScheduleCreateCallbacks {
  readonly onSuccess: (schedule: PracticeSchedule) => void;
  readonly onError: (error: unknown) => void;
}

/**
 * The update mutation reports only that it succeeded — `useInvalidatingMutation`
 * always calls `onSuccess` with no argument, and the screen already holds the
 * record it just saved.
 */
export interface ScheduleUpdateCallbacks {
  readonly onSuccess: () => void;
  readonly onError: (error: unknown) => void;
}

export interface ScheduleArchiveCallbacks {
  readonly onSuccess: () => void;
  readonly onError: (error: unknown) => void;
}

/** The generate mutation reports what it did, so the screen can say how many. */
export interface ScheduleGenerateCallbacks {
  readonly onSuccess: (result: GenerationResult) => void;
  readonly onError: (error: unknown) => void;
}
