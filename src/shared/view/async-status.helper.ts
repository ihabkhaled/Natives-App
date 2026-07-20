import type { AsyncViewStatus } from '@/shared/ui';

/** Everything the shared state machine needs to pick one screen state. */
export interface AsyncStatusInput {
  readonly isForbidden: boolean;
  readonly isLoading: boolean;
  readonly hasError: boolean;
  readonly isOffline: boolean;
  readonly hasData: boolean;
  readonly hasItems: boolean;
}

function resolveBlockingStatus(input: AsyncStatusInput): AsyncViewStatus | null {
  if (input.isForbidden) {
    return 'forbidden';
  }
  if (input.isLoading) {
    return 'loading';
  }
  if (input.hasData) {
    return null;
  }
  if (input.isOffline) {
    return 'offline';
  }
  return input.hasError ? 'error' : 'loading';
}

/**
 * Pure state machine deciding the single state a screen presents. Forbidden
 * wins over everything: a principal without the grant is never shown a
 * spinner that resolves into data they may not read. Cached data survives an
 * offline blip, so a stale-but-present list keeps rendering.
 */
export function resolveAsyncViewStatus(input: AsyncStatusInput): AsyncViewStatus {
  const blocking = resolveBlockingStatus(input);
  if (blocking !== null) {
    return blocking;
  }
  return input.hasItems ? 'ready' : 'empty';
}
