import type { DeclareAvailabilityCommand, TransitionSquadCommand } from './competitions.types';
import type { RemoveRosterEntryCommand, RosterLifecycleCommand } from './rosters.types';

/**
 * One selection intent. `override` carries the coach's mandatory reason, which
 * is why the shape is a discriminated union rather than an optional field.
 */
export type SelectionCommand =
  | { readonly intent: 'select'; readonly membershipId: string }
  | { readonly intent: 'override'; readonly membershipId: string; readonly overrideReason: string }
  | { readonly intent: 'remove'; readonly membershipId: string };

export interface SelectionMutationView {
  readonly run: (command: SelectionCommand) => void;
  readonly isRunning: boolean;
}

export interface AvailabilityMutationView {
  readonly run: (command: DeclareAvailabilityCommand) => void;
  readonly isRunning: boolean;
}

export interface TransitionMutationView {
  readonly run: (command: TransitionSquadCommand) => void;
  readonly isRunning: boolean;
}

/** What a squad panel hook needs from the workspace that owns it. */
export interface SquadPanelInput {
  readonly teamId: string;
  readonly squadId: string;
  readonly isLocked: boolean;
  readonly canSelect: boolean;
  readonly canOverride: boolean;
}

/** What the availability panel needs: scope plus whether the window is open. */
export interface AvailabilityPanelInput {
  readonly teamId: string;
  readonly squadId: string;
  readonly isWindowClosed: boolean;
}

export interface RosterEntryMutationView {
  readonly run: (command: RemoveRosterEntryCommand) => void;
  readonly isRunning: boolean;
}

export interface RosterLifecycleMutationView {
  readonly run: (command: RosterLifecycleCommand) => void;
  readonly isRunning: boolean;
}
