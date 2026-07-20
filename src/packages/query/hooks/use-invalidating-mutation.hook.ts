import type { QueryKey } from '@tanstack/react-query';

import { useAppMutation } from './use-app-mutation.hook';
import { useQueryClient } from '@tanstack/react-query';

/** What a feature mutation reports back and which cache branch it refreshes. */
export interface InvalidatingMutationOptions<TResult, TVariables> {
  readonly mutationFn: (variables: TVariables) => Promise<TResult>;
  readonly invalidateKey: QueryKey;
  readonly onSuccess: () => void;
  readonly onError: () => void;
}

export interface InvalidatingMutationView<TVariables> {
  readonly run: (variables: TVariables) => void;
  readonly isRunning: boolean;
}

/**
 * One command plus the cache branch it invalidates. Feature modules compose
 * this instead of repeating the mutate/invalidate wiring per use case.
 */
export function useInvalidatingMutation<TResult, TVariables>(
  options: InvalidatingMutationOptions<TResult, TVariables>,
): InvalidatingMutationView<TVariables> {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<TResult, TVariables>({
    mutationFn: options.mutationFn,
    onSuccess: options.onSuccess,
    onError: options.onError,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: options.invalidateKey });
    },
  });
  return {
    run: (variables) => {
      mutation.mutate(variables);
    },
    isRunning: mutation.isPending,
  };
}
