import { useAppMutation } from '@/packages/query';
import { type AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import type { AuthSession } from '../mappers/auth.mapper';
import { acceptInvitation } from '../services/accept-invitation.service';
import { useSessionStore } from '../store/session.store';

interface AcceptInvitationInput {
  readonly token: string;
  readonly password: string;
}

export interface AcceptInvitationMutationView {
  readonly accept: (input: AcceptInvitationInput) => void;
  readonly isSubmitting: boolean;
  readonly error: AppError | null;
}

/** Accept-invitation mutation: on success the session flips and guards redirect. */
export function useAcceptInvitationMutation(): AcceptInvitationMutationView {
  const markAuthenticated = useSessionStore((state) => state.markAuthenticated);
  const mutation = useAppMutation<AuthSession, AcceptInvitationInput>({
    mutationFn: (input) => acceptInvitation(input.token, input.password),
    onSuccess: () => {
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
