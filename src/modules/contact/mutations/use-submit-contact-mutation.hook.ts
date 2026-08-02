import { useAppMutation } from '@/packages/query';
import { toAppError, type AppError } from '@/shared/errors';

import { submitContactRequest } from '../services/submit-contact.service';
import type { ContactRequestDto, ContactResponseDto } from '../types/contact.types';

export interface SubmitContactMutationView {
  readonly submit: (request: ContactRequestDto) => void;
  /** Re-send the last attempt verbatim; a no-op before the first submit. */
  readonly retry: () => void;
  readonly isSubmitting: boolean;
  readonly isSent: boolean;
  readonly error: AppError | null;
}

/**
 * The contact relay mutation. The last variables are kept by the mutation
 * itself, so a network failure can offer a truthful "try again" that resends
 * exactly what the visitor wrote instead of re-reading a form that may have
 * changed underneath them.
 */
export function useSubmitContactMutation(): SubmitContactMutationView {
  const mutation = useAppMutation<ContactResponseDto, ContactRequestDto>({
    mutationFn: (request) => submitContactRequest(request),
  });
  const lastRequest = mutation.variables;
  return {
    submit: (request) => {
      mutation.mutate(request);
    },
    retry: () => {
      if (lastRequest !== undefined) {
        mutation.mutate(lastRequest);
      }
    },
    isSubmitting: mutation.isPending,
    isSent: mutation.isSuccess,
    error: mutation.error === null ? null : toAppError(mutation.error),
  };
}
