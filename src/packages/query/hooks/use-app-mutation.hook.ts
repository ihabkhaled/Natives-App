import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';

/**
 * The single owner of useMutation access. Module mutation hooks compose
 * this instead of importing TanStack Query directly.
 */
export function useAppMutation<TData, TVariables, TError = unknown>(
  options: UseMutationOptions<TData, TError, TVariables>,
): UseMutationResult<TData, TError, TVariables> {
  return useMutation(options);
}
