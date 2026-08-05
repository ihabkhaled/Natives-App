import type { ReminderDispatchResult, ReminderTestResult } from '../types/practice-reminders.types';

/** Which session a reminder mutation acts on. */
export interface ReminderMutationScope {
  readonly teamId: string;
  readonly sessionId: string;
}

/** A command with no variables, plus whether it is in flight. */
export interface ReminderMutationView {
  readonly run: () => void;
  readonly isRunning: boolean;
}

/** The dispatch reports what it queued, so the screen can say how many. */
export interface ReminderDispatchCallbacks {
  readonly onSuccess: (result: ReminderDispatchResult) => void;
  readonly onError: (error: unknown) => void;
}

/** A self-test reports whether it queued, and why not when it did not. */
export interface ReminderTestCallbacks {
  readonly onSuccess: (result: ReminderTestResult) => void;
  readonly onError: (error: unknown) => void;
}
