import type { SelectFieldOption } from '@/shared/ui';
import { I18N_KEYS } from '@/shared/i18n';

import { CATEGORY_LABEL_KEYS } from '../constants/notifications-labels.constants';
import {
  ALL_CATEGORIES_FILTER,
  INBOX_STATUS_FILTERS,
  NOTIFICATION_CATEGORIES,
} from '../constants/notifications.constants';

type Translate = (key: string) => string;

const STATUS_LABEL_KEYS: Record<(typeof INBOX_STATUS_FILTERS)[number], string> = {
  all: I18N_KEYS.notifications.statusAll,
  unread: I18N_KEYS.notifications.statusUnread,
  read: I18N_KEYS.notifications.statusRead,
};

export function buildStatusOptions(t: Translate): readonly SelectFieldOption[] {
  return INBOX_STATUS_FILTERS.map((value) => ({ value, label: t(STATUS_LABEL_KEYS[value]) }));
}

/** Category filter, with an explicit "all" entry ahead of the catalog. */
export function buildCategoryOptions(t: Translate): readonly SelectFieldOption[] {
  return [
    { value: ALL_CATEGORIES_FILTER, label: t(I18N_KEYS.notifications.categoryAll) },
    ...NOTIFICATION_CATEGORIES.map((category) => ({
      value: category,
      label: t(CATEGORY_LABEL_KEYS[category]),
    })),
  ];
}
