import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppMutation, useQueryClient } from '@/packages/query';
import type { QueryKey } from '@/packages/query';
import { useAppToast, useConfirmAlert } from '@/shared/ui';

/** One lifecycle move, addressed by the record it applies to. */
interface TransitionRequest {
  readonly id: string;
  readonly transition: string;
  readonly expectedVersion: number;
}

export interface LifecycleTransitionInput {
  readonly run: (request: TransitionRequest) => Promise<unknown>;
  readonly invalidateKey: QueryKey;
  readonly confirmTitle: string;
  readonly confirmCta: string;
  readonly cancelLabel: string;
  readonly successMessage: string;
  readonly resolveErrorMessage: (error: unknown) => string;
}

export interface LifecycleTransitionView {
  readonly isRunning: boolean;
  readonly request: (request: TransitionRequest) => void;
  /** The last refusal, in the caller's own words; null once it is superseded. */
  readonly errorMessage: string | null;
}

/**
 * Confirm-then-run for a lifecycle move, shared by the team and season screens.
 *
 * A refused move is reported with the reason the server gave (mapped to our
 * copy), not swallowed into a generic retry: "this team already has an active
 * season" is actionable, "something went wrong" is not.
 */
export function useLifecycleTransition(input: LifecycleTransitionInput): LifecycleTransitionView {
  useAppTranslation();
  const { showToast } = useAppToast();
  const { confirm } = useConfirmAlert();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mutation = useAppMutation<unknown, TransitionRequest>({
    mutationFn: (request) => input.run(request),
    onSuccess: () => {
      setErrorMessage(null);
      void showToast({ message: input.successMessage, tone: 'success' });
    },
    onError: (error: unknown) => {
      const message = input.resolveErrorMessage(error);
      setErrorMessage(message);
      void showToast({ message, tone: 'danger' });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: input.invalidateKey });
    },
  });
  return {
    isRunning: mutation.isPending,
    errorMessage,
    request: (request) => {
      void confirm({
        header: input.confirmTitle,
        confirmLabel: input.confirmCta,
        cancelLabel: input.cancelLabel,
      }).then((confirmed) => {
        if (confirmed) {
          mutation.mutate(request);
        }
      });
    },
  };
}
