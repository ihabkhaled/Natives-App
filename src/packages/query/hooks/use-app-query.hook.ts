import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
  type QueryKey,
} from '@tanstack/react-query';

/**
 * The single owner of useQuery access. Module query hooks compose this
 * instead of importing TanStack Query directly.
 */
export function useAppQuery<TData, TError = unknown>(
  options: UseQueryOptions<TData, TError, TData, QueryKey>,
): UseQueryResult<TData, TError> {
  return useQuery(options);
}
