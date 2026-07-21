import type { AppError } from '@/shared/errors/app.errors';
import type { AsyncViewStatus } from '@/shared/ui';
import type { RemoteQueryView } from '@/shared/view';
import { buildScreenCopy, resolveScreenStatus } from '@/shared/view';

import type {
  MatchesContextView,
  MatchesScreenCopy,
  ScreenCopyNamespace,
} from '../types/matches-view.types';

type Translate = (key: string) => string;

export interface MatchesCopyInput {
  readonly namespace: ScreenCopyNamespace;
  readonly error: AppError | null;
  readonly isOffline: boolean;
  readonly onRetry: () => void;
  readonly emptyTitleKey: string;
  readonly emptyMessageKey: string;
}

/** The matches namespaces bound to the shared screen-copy builder. */
export function buildMatchesScreenCopy(t: Translate, input: MatchesCopyInput): MatchesScreenCopy {
  return buildScreenCopy(t, { ...input, keys: input.namespace });
}

/** The matches context bound to the shared status resolver. */
export function resolveMatchesScreenStatus(
  context: MatchesContextView,
  query: RemoteQueryView<unknown>,
  permitted: boolean,
  hasItems: boolean,
): AsyncViewStatus {
  return resolveScreenStatus(context, query, permitted, hasItems);
}
