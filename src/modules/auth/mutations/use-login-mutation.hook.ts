import { useAppMutation } from '@/packages/query';
import { type AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import type { AuthSession } from '../mappers/auth.mapper';
import { loginUser } from '../services/login.service';
import { useSessionStore } from '../store/session.store';
import type { LoginCredentials } from '../types/auth.types';

export interface LoginMutationView {
  readonly login: (credentials: LoginCredentials) => void;
  readonly isSubmitting: boolean;
  readonly error: AppError | null;
}

/** Login mutation: on success the session flips and route guards redirect. */
export function useLoginMutation(): LoginMutationView {
  const markAuthenticated = useSessionStore((state) => state.markAuthenticated);
  const mutation = useAppMutation<AuthSession, LoginCredentials>({
    mutationFn: (credentials) => loginUser(credentials),
    onSuccess: () => {
      markAuthenticated();
    },
  });
  return {
    login: (credentials) => {
      mutation.mutate(credentials);
    },
    isSubmitting: mutation.isPending,
    error: mutation.error === null ? null : toAppError(mutation.error),
  };
}
