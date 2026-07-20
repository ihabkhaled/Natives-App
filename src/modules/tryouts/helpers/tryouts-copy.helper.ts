import type { AppError } from '@/shared/errors/app.errors';
import type { AsyncViewStatus } from '@/shared/ui';
import type { RemoteQueryView } from '@/shared/view';
import { buildScreenCopy, resolveScreenStatus } from '@/shared/view';

import { TRYOUTS_COPY_NAMESPACE } from '../constants/tryouts-labels.constants';
import type { TryoutsContextView, TryoutsScreenCopy } from '../types/tryouts-view.types';

type Translate = (key: string) => string;

export interface TryoutsCopyInput {
  readonly error: AppError | null;
  readonly isOffline: boolean;
  readonly onRetry: () => void;
  readonly emptyTitleKey: string;
  readonly emptyMessageKey: string;
}

/** The tryouts namespace bound to the shared screen-copy builder. */
export function buildTryoutsScreenCopy(t: Translate, input: TryoutsCopyInput): TryoutsScreenCopy {
  return buildScreenCopy(t, { ...input, keys: TRYOUTS_COPY_NAMESPACE });
}

/** The tryouts context bound to the shared status resolver. */
export function resolveTryoutsScreenStatus(
  context: TryoutsContextView,
  query: RemoteQueryView<unknown>,
  permitted: boolean,
  hasItems: boolean,
): AsyncViewStatus {
  return resolveScreenStatus(context, query, permitted, hasItems);
}
