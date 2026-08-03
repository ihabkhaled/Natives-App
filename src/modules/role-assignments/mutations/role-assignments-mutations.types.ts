/** What every role-assignment command reports back to the screen. */
export interface RoleAssignmentsMutationCallbacks {
  readonly onSuccess: () => void;
  readonly onError: (error: unknown) => void;
}
