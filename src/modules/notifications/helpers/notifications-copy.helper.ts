import type { AppError } from '@/shared/errors/app.errors';
import type { AsyncViewStatus } from '@/shared/ui';
import {
  buildScreenCopy,
  resolveScreenStatus,
  type ScreenCopy,
  type RemoteQueryView,
} from '@/shared/view';

import { NOTIFICATIONS_COPY_NAMESPACE } from '../constants/notifications-labels.constants';
import type { NotificationsContextView } from '../types/notifications-view.types';

type Translate = (key: string) => string;

export interface NotificationsCopyInput {
  readonly error: AppError | null;
  readonly isOffline: boolean;
  readonly onRetry: () => void;
  readonly emptyTitleKey: string;
  readonly emptyMessageKey: string;
}

/** The notifications namespace bound to the shared screen-copy builder. */
export function buildNotificationsScreenCopy(
  t: Translate,
  input: NotificationsCopyInput,
): ScreenCopy {
  return buildScreenCopy(t, { ...input, keys: NOTIFICATIONS_COPY_NAMESPACE });
}

/** The notifications context bound to the shared status resolver. */
export function resolveNotificationsScreenStatus(
  context: NotificationsContextView,
  query: RemoteQueryView<unknown>,
  permitted: boolean,
  hasItems: boolean,
): AsyncViewStatus {
  return resolveScreenStatus(context, query, permitted, hasItems);
}
