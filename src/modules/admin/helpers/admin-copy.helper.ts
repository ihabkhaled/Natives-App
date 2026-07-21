import type { AppError } from '@/shared/errors/app.errors';
import type { AsyncViewStatus } from '@/shared/ui';
import {
  buildScreenCopy,
  resolveScreenStatus,
  type RemoteQueryView,
  type ScreenCopy,
  type ScreenCopyKeys,
} from '@/shared/view';

import type { AdminContextView } from '../types/admin-view.types';

type Translate = (key: string) => string;

export interface AdminCopyInput {
  readonly keys: ScreenCopyKeys;
  readonly error: AppError | null;
  readonly isOffline: boolean;
  readonly onRetry: () => void;
  readonly emptyTitleKey: string;
  readonly emptyMessageKey: string;
}

/** One admin namespace bound to the shared screen-copy builder. */
export function buildAdminScreenCopy(t: Translate, input: AdminCopyInput): ScreenCopy {
  return buildScreenCopy(t, input);
}

/** The admin context bound to the shared status resolver. */
export function resolveAdminScreenStatus(
  context: AdminContextView,
  query: RemoteQueryView<unknown>,
  permitted: boolean,
  hasItems: boolean,
): AsyncViewStatus {
  return resolveScreenStatus(context, query, permitted, hasItems);
}
