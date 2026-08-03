/** What every agenda command reports back to the screen. */
export interface PracticeAgendaMutationCallbacks {
  readonly onSuccess: () => void;
  readonly onError: (error: unknown) => void;
}

/** The session one command acts on. */
export interface AgendaMutationScope {
  readonly teamId: string;
  readonly sessionId: string;
}

/** A reorder as the screen issues it; the scope is already bound. */
export interface ReorderBlocksInput {
  readonly blockIds: readonly string[];
  readonly expectedVersion: number | null;
}

/** A station removal as the screen issues it. */
export interface RemoveStationInput {
  readonly blockId: string;
  readonly stationId: string;
}
