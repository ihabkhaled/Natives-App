import { useAppMutation } from '@/packages/query';
import { type AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { submitSignup } from '../services/signup.service';
import type { AccountState } from '../types/auth.types';
import type { SignupFormValues } from '../types/signup.types';

export interface SignupMutationView {
  readonly requestAccount: (values: SignupFormValues) => void;
  readonly isSubmitting: boolean;
  readonly isSubmitted: boolean;
  /** The state the backend reported; `undefined` until the request lands. */
  readonly accountState: AccountState | undefined;
  readonly error: AppError | null;
}

/**
 * Signup mutation. It deliberately touches neither the session store nor the
 * token repository: the request returns no credentials, so flipping the app
 * into an authenticated state here would be a lie the guards then have to
 * unwind.
 */
export function useSignupMutation(): SignupMutationView {
  const mutation = useAppMutation<AccountState, SignupFormValues>({
    mutationFn: (values) => submitSignup(values),
  });
  return {
    requestAccount: (values) => {
      mutation.mutate(values);
    },
    isSubmitting: mutation.isPending,
    isSubmitted: mutation.isSuccess,
    accountState: mutation.data,
    error: mutation.error === null ? null : toAppError(mutation.error),
  };
}
