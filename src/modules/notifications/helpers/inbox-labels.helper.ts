import { I18N_KEYS } from '@/shared/i18n';
import type { SelectFieldOption } from '@/shared/ui';

import { NOTIFICATION_LIMITS } from '../constants/notifications.constants';
import { buildCategoryOptions, buildStatusOptions } from './notification-options.helper';

type Translate = (key: string, params?: Record<string, string | number>) => string;

export interface InboxLabelInput {
  readonly unread: number;
  readonly shown: number;
  readonly total: number;
  readonly canReadDeliveryFailures: boolean;
}

/** Every static, translated label the inbox renders, built in one place. */
export interface InboxLabels {
  readonly title: string;
  readonly subtitle: string;
  readonly unreadLabel: string;
  readonly markAllReadLabel: string;
  readonly statusFilterLabel: string;
  readonly statusOptions: readonly SelectFieldOption[];
  readonly categoryFilterLabel: string;
  readonly categoryOptions: readonly SelectFieldOption[];
  readonly countLabel: string;
  readonly noMatchesTitle: string;
  readonly noMatchesMessage: string;
  readonly boundedNotice: string;
  readonly loadMoreLabel: string;
  readonly deliveryNotice: string;
  readonly deliveryLinkLabel: string | null;
  readonly preferencesLinkLabel: string;
}

export function buildInboxLabels(t: Translate, input: InboxLabelInput): InboxLabels {
  return {
    title: t(I18N_KEYS.notifications.title),
    subtitle: t(I18N_KEYS.notifications.subtitle),
    unreadLabel:
      input.unread === 0
        ? t(I18N_KEYS.notifications.allReadLabel)
        : t(I18N_KEYS.notifications.unreadCount, { count: input.unread }),
    markAllReadLabel: t(I18N_KEYS.notifications.markAllRead),
    statusFilterLabel: t(I18N_KEYS.notifications.statusFilterLabel),
    statusOptions: buildStatusOptions(t),
    categoryFilterLabel: t(I18N_KEYS.notifications.categoryFilterLabel),
    categoryOptions: buildCategoryOptions(t),
    countLabel: t(I18N_KEYS.notifications.countLabel, {
      shown: input.shown,
      total: input.total,
    }),
    noMatchesTitle: t(I18N_KEYS.notifications.noMatchesTitle),
    noMatchesMessage: t(I18N_KEYS.notifications.noMatchesMessage),
    boundedNotice: t(I18N_KEYS.notifications.boundedNotice, { max: NOTIFICATION_LIMITS.maxItems }),
    loadMoreLabel: t(I18N_KEYS.notifications.loadMore),
    deliveryNotice: t(I18N_KEYS.notifications.deliveryOtherChannelsNote),
    deliveryLinkLabel: input.canReadDeliveryFailures
      ? t(I18N_KEYS.notifications.deliveryAdminLink)
      : null,
    preferencesLinkLabel: t(I18N_KEYS.notifications.preferencesLink),
  };
}
