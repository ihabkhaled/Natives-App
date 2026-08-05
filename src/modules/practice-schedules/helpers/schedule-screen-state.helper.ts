/** Which of the four mutually exclusive states a schedules screen is in. */
export type ScheduleScreenState = 'forbidden' | 'loading' | 'error' | 'ready';

/** What the state depends on, without dragging the whole view in. */
export interface ScheduleScreenStateInput {
  readonly isForbidden: boolean;
  readonly isLoading: boolean;
  readonly hasError: boolean;
}

/**
 * Resolve a schedules screen's state once, in priority order. Shared by the
 * list and detail screens — both resolve the same three inputs the same way —
 * so "forbidden" and "loading" can never render together on either one.
 * Lives here rather than in a component because presentational files carry no
 * branching logic.
 */
export function resolveScheduleScreenState(input: ScheduleScreenStateInput): ScheduleScreenState {
  if (input.isForbidden) {
    return 'forbidden';
  }
  if (input.isLoading) {
    return 'loading';
  }
  return input.hasError ? 'error' : 'ready';
}
