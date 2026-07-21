import { I18N_KEYS } from '@/shared/i18n';

import {
  CATEGORY_LABEL_KEYS,
  CHANNEL_LABEL_KEYS,
} from '../constants/notifications-labels.constants';
import type { NotificationPreference, UpdatePreferenceCommand } from '../types/notifications.types';
import type { PreferenceRowView } from '../types/notifications-view.types';
import { buildPreferenceMatrix } from './notification-preference.helper';

type Translate = (key: string) => string;
type Toggle = (command: UpdatePreferenceCommand) => void;

/**
 * The category × channel switch grid. A locked cell carries a no-op handler
 * and an explicit "always on" label, so the control is honest about the fact
 * that security and system notices are not mutable.
 */
export function buildPreferenceRows(
  t: Translate,
  preferences: readonly NotificationPreference[],
  toggle: Toggle,
): readonly PreferenceRowView[] {
  return buildPreferenceMatrix(preferences).map((row) => ({
    key: row.category,
    categoryLabel: t(CATEGORY_LABEL_KEYS[row.category]),
    mandatoryLabel: row.hasLockedCell ? t(I18N_KEYS.notifications.mandatoryBadge) : null,
    cells: row.cells.map((cell) => ({
      key: `${row.category}-${cell.channel}`,
      channelLabel: t(CHANNEL_LABEL_KEYS[cell.channel]),
      enabled: cell.enabled,
      locked: cell.locked,
      onToggle: () => {
        if (!cell.locked) {
          toggle({ category: row.category, channel: cell.channel, enabled: !cell.enabled });
        }
      },
    })),
  }));
}
