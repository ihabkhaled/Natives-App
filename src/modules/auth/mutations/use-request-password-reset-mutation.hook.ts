import { useAppMutation } from '@/packages/query';
import { type AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { requestPasswordResetLink } from '../services/request-password-reset.service';

export interface RequestPasswordResetView {
  readonly requestReset: (email: string) => void;
  readonly isSubmitting: boolean;
  readonly isSubmitted: boolean;
  readonly error: AppError | null;
}

/**
 * Forgot-password mutation. Success flips `isSubmitted` so the screen can show
 * one enumeration-safe confirmation regardless of whether the account exists.
 */
export function useRequestPasswordResetMutation(): RequestPasswordResetView {
  const mutation = useAppMutation<boolean, string>({
    mutationFn: async (email) => {
      await requestPasswordResetLink(email);
      return true;
    },
  });
  return {
    requestReset: (email) => {
      mutation.mutate(email);
    },
    isSubmitting: mutation.isPending,
    isSubmitted: mutation.isSuccess,
    error: mutation.error === null ? null : toAppError(mutation.error),
  };
}
