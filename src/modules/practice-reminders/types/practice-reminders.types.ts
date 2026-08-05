import type { ReminderSuppressionReason } from '../constants/practice-reminders.constants';

/** Which session's reminders a request is about. */
export interface ReminderRequestParams {
  readonly teamId: string;
  readonly sessionId: string;
}

/**
 * The reminder state of one session.
 *
 * `cutoff` is the server's judgement that the reminder window has closed, and
 * `urgentCancellationOverride` is the one thing that reopens it — a session
 * cancelled late is worth waking people for even past the cutoff.
 */
export interface ReminderStatus {
  readonly sessionId: string;
  readonly totalEligible: number;
  readonly noResponse: number;
  readonly upcoming: boolean;
  readonly cutoff: boolean;
  readonly urgentCancellationOverride: boolean;
  readonly kinds: readonly string[];
}

/** The outcome of enqueueing the reminders that were due. */
export interface ReminderDispatchResult {
  readonly candidates: number;
  readonly enqueued: number;
}

/** The outcome of a self-test send. */
export interface ReminderTestResult {
  readonly enqueued: boolean;
  readonly reason: ReminderSuppressionReason | null;
}
