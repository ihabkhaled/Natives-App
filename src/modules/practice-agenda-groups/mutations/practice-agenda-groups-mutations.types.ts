/** Which session a group command acts on. */
export interface AgendaGroupsMutationScope {
  readonly teamId: string;
  readonly sessionId: string;
}

/** What every group command reports back to the screen. */
export interface AgendaGroupsMutationCallbacks {
  readonly onSuccess: () => void;
  readonly onError: (error: unknown) => void;
}

/** A new group as the screen issues it; the scope is already bound. */
export interface CreateGroupInput {
  readonly name: string;
  readonly color: string | null;
  readonly coachMembershipId: string | null;
  readonly notes: string | null;
}

export interface RemoveGroupInput {
  readonly groupId: string;
}

export interface AssignGroupMembersInput {
  readonly groupId: string;
  readonly membershipIds: readonly string[];
}

export interface RemoveGroupMemberInput {
  readonly groupId: string;
  readonly membershipId: string;
}

export interface CopyAgendaInput {
  readonly sourceSessionId: string;
}
