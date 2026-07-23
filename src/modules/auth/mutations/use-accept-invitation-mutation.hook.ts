import { useAppMutation, useQueryClient } from '@/packages/query';
import { type AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import type { AuthSession } from '../mappers/auth.mapper';
import { authQueryKeys } from '../queries/auth.keys';
import { acceptInvitation } from '../services/accept-invitation.service';
import { useSessionStore } from '../store/session.store';

interface AcceptInvitationInput {
  readonly token: string;
  readonly password: string;
  readonly displayName: string;
}

export interface AcceptInvitationMutationView {
  readonly accept: (input: AcceptInvitationInput) => void;
  readonly isSubmitting: boolean;
  readonly error: AppError | null;
}

/**
 * Accept-invitation mutation: on success the session flips and guards
 * redirect. The current-user and effective-permission caches are invalidated
 * in the same breath so the shell renders the INVITED role's navigation
 * immediately — never a stale permission set that needs a manual refresh.
 */
export function useAcceptInvitationMutation(): AcceptInvitationMutationView {
  const markAuthenticated = useSessionStore((state) => state.markAuthenticated);
  const queryClient = useQueryClient();
  const mutation = useAppMutation<AuthSession, AcceptInvitationInput>({
    mutationFn: (input) => acceptInvitation(input.token, input.password, input.displayName),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser() });
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.effectivePermissionsRoot() });
      markAuthenticated();
    },
  });
  return {
    accept: (input) => {
      mutation.mutate(input);
    },
    isSubmitting: mutation.isPending,
    error: mutation.error === null ? null : toAppError(mutation.error),
  };
}
