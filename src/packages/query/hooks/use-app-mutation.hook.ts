import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';

/**
 * The single owner of useMutation access. Module mutation hooks compose
 * this instead of importing TanStack Query directly. `TContext` carries the
 * optimistic snapshot returned by `onMutate` through to `onError`/`onSettled`.
 */
export function useAppMutation<TData, TVariables, TError = unknown, TContext = unknown>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
): UseMutationResult<TData, TError, TVariables, TContext> {
  return useMutation(options);
}
