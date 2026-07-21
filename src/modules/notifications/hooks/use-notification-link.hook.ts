import { useEffect, useRef } from 'react';

import { useEffectivePermissions } from '@/modules/auth';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation, useRouteParam } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';

import { NOTIFICATION_ID_PARAM } from '../constants/notifications-route.constants';
import { NOTIFICATION_LIMITS } from '../constants/notifications.constants';
import { linkStatusFor, resolveLink } from '../helpers/link-resolution.helper';
import { buildNotificationsScreenCopy } from '../helpers/notifications-copy.helper';
import { useMarkReadMutation } from '../mutations/use-mark-read-mutation.hook';
import { notificationsPagePath } from '../routes/notifications.paths';
import type { NotificationLinkView } from '../types/notifications-view.types';
import { useNotificationsContext } from './use-notifications-context.hook';
import { useNotificationsQuery } from './use-notifications-query.hook';

/**
 * The deep-link arrival screen's view model.
 *
 * Authorization is re-checked here, on arrival, against the *current*
 * effective grants — not against whatever was true when the notification was
 * sent. Nothing from the target is fetched until the check passes, so a
 * revoked permission yields the designed forbidden state with no leak, and
 * the screen renders no payload in any outcome.
 *
 * Read state is idempotent twice over: the ref stops a re-render from firing
 * a second command, and the endpoint itself accepts a repeat.
 */
export function useNotificationLink(): NotificationLinkView {
  const { t } = useAppTranslation();
  const context = useNotificationsContext();
  const navigation = useAppNavigation();
  const permissions = useEffectivePermissions();
  const notificationId = useRouteParam(NOTIFICATION_ID_PARAM) ?? '';
  const query = useNotificationsQuery(NOTIFICATION_LIMITS.maxItems);
  const markRead = useMarkReadMutation({ onSuccess: () => undefined, onError: () => undefined });
  const markedId = useRef<string | null>(null);

  const { outcome, path } = resolveLink({
    isLoading: query.isLoading || permissions.isLoading,
    hasError: query.error !== null,
    item: query.data?.items.find((entry) => entry.id === notificationId),
    grantedPermissions: permissions.permissions,
  });

  const { run: markAsRead } = markRead;
  useEffect(() => {
    if (outcome === 'authorized' && markedId.current !== notificationId) {
      markedId.current = notificationId;
      markAsRead(notificationId);
    }
  }, [outcome, notificationId, markAsRead]);

  return {
    ...buildNotificationsScreenCopy(t, {
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
      emptyTitleKey: I18N_KEYS.notifications.linkStaleTitle,
      emptyMessageKey: I18N_KEYS.notifications.linkStaleMessage,
    }),
    forbiddenTitle: t(I18N_KEYS.notifications.linkForbiddenTitle),
    forbiddenMessage: t(I18N_KEYS.notifications.linkForbiddenMessage),
    title: t(I18N_KEYS.notifications.linkTitle),
    status: linkStatusFor(outcome, context.isOffline),
    redirectPath: path,
    resolvingLabel: t(I18N_KEYS.notifications.linkResolving),
    noPreviewNotice: t(I18N_KEYS.notifications.linkNoPreviewNotice),
    backLabel: t(I18N_KEYS.notifications.linkBack),
    onBack: () => {
      navigation.push(notificationsPagePath());
    },
  };
}
