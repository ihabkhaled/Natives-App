import { toAppError } from '../errors/app-error.helper';
import type { AppError } from '../errors/app.errors';

/** One remote read, normalized: data, pending flag, and an AppError or null. */
export interface RemoteQueryView<TData> {
  readonly data: TData | undefined;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly refetch: () => void;
}

/** The raw TanStack result shape a module query hook hands over. */
export interface RawQueryResult<TData> {
  readonly data: TData | undefined;
  readonly isPending: boolean;
  readonly error: unknown;
  readonly refetch: () => unknown;
}

/**
 * Normalize a query result once, so every module hook exposes the same
 * `{ data, isLoading, error, refetch }` shape and no raw backend error object
 * escapes into a view model.
 */
export function toRemoteQueryView<TData>(query: RawQueryResult<TData>): RemoteQueryView<TData> {
  return {
    data: query.data,
    isLoading: query.isPending,
    error: query.error === null || query.error === undefined ? null : toAppError(query.error),
    refetch: () => {
      void query.refetch();
    },
  };
}
