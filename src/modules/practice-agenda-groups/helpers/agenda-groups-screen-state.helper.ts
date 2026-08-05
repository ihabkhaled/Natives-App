/** Which of the four mutually exclusive states the groups-and-plan screen is in. */
export type AgendaGroupsScreenState = 'forbidden' | 'loading' | 'error' | 'ready';

/** What the state depends on, without dragging the whole view in. */
export interface AgendaGroupsScreenStateInput {
  readonly isForbidden: boolean;
  readonly isLoading: boolean;
  readonly hasError: boolean;
}

/**
 * Resolve the screen's state once, in priority order.
 *
 * A single value rather than three independent booleans: it is what stops
 * "forbidden" and "loading" rendering together while permissions are still
 * resolving. Lives here rather than in the component because presentational
 * files carry no branching logic.
 */
export function resolveAgendaGroupsScreenState(
  input: AgendaGroupsScreenStateInput,
): AgendaGroupsScreenState {
  if (input.isForbidden) {
    return 'forbidden';
  }
  if (input.isLoading) {
    return 'loading';
  }
  return input.hasError ? 'error' : 'ready';
}
