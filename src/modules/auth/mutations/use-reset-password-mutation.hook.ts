import { useAppMutation } from '@/packages/query';
import { type AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { resetPassword } from '../services/reset-password.service';
import type { SetPasswordFormValues } from '../types/auth.types';

interface ResetPasswordInput {
  readonly token: string;
  readonly values: SetPasswordFormValues;
}

export interface ResetPasswordMutationView {
  readonly submitReset: (input: ResetPasswordInput) => void;
  readonly isSubmitting: boolean;
  readonly isSuccess: boolean;
  readonly error: AppError | null;
}

/** Reset-password mutation. Success flips `isSuccess` to reveal the done state. */
export function useResetPasswordMutation(): ResetPasswordMutationView {
  const mutation = useAppMutation<boolean, ResetPasswordInput>({
    mutationFn: async (input) => {
      await resetPassword(input.token, input.values);
      return true;
    },
  });
  return {
    submitReset: (input) => {
      mutation.mutate(input);
    },
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error === null ? null : toAppError(mutation.error),
  };
}
