import type { AppError } from '@/shared/errors/app.errors';
import type { AsyncViewStatus } from '@/shared/ui';
import type { RemoteQueryView } from '@/shared/view';
import { buildScreenCopy, resolveScreenStatus } from '@/shared/view';

import type {
  CompetitionsContextView,
  CompetitionsScreenCopy,
  ScreenCopyNamespace,
} from '../types/competitions-view.types';

type Translate = (key: string) => string;

export interface CompetitionsCopyInput {
  readonly namespace: ScreenCopyNamespace;
  readonly error: AppError | null;
  readonly isOffline: boolean;
  readonly onRetry: () => void;
  readonly emptyTitleKey: string;
  readonly emptyMessageKey: string;
}

/** The competitions namespace bound to the shared screen-copy builder. */
export function buildCompetitionsScreenCopy(
  t: Translate,
  input: CompetitionsCopyInput,
): CompetitionsScreenCopy {
  return buildScreenCopy(t, { ...input, keys: input.namespace });
}

/** The competitions context bound to the shared status resolver. */
export function resolveCompetitionsScreenStatus(
  context: CompetitionsContextView,
  query: RemoteQueryView<unknown>,
  permitted: boolean,
  hasItems: boolean,
): AsyncViewStatus {
  return resolveScreenStatus(context, query, permitted, hasItems);
}
