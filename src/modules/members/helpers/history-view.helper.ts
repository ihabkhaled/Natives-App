import { formatCairoDateTime } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  MEMBERSHIP_STATUS_LABEL_KEYS,
  type MembershipStatus,
} from '../constants/members.constants';
import type { HistoryItemView } from '../types/members-view.types';
import type { MemberStatusEvent } from '../types/members.types';

type Translate = (key: string, params?: TranslateParams) => string;

const UNKNOWN_STATUS_LABEL = '—';

function statusLabel(t: Translate, status: MembershipStatus | null): string {
  return status === null ? UNKNOWN_STATUS_LABEL : t(MEMBERSHIP_STATUS_LABEL_KEYS[status]);
}

/** Build the translated, Cairo-time status-history timeline (newest first). */
export function buildHistoryItems(
  t: Translate,
  locale: string,
  events: readonly MemberStatusEvent[],
): readonly HistoryItemView[] {
  return events.map((event) => ({
    id: event.id,
    transitionLabel: t(I18N_KEYS.members.historyTransition, {
      from: statusLabel(t, event.fromStatus),
      to: statusLabel(t, event.toStatus),
    }),
    reasonLabel:
      event.reason === null ? null : t(I18N_KEYS.members.historyReason, { reason: event.reason }),
    actorLabel: event.actorUserId ?? t(I18N_KEYS.members.historySystemActor),
    timeLabel: formatCairoDateTime(event.occurredAtIso, locale),
  }));
}
