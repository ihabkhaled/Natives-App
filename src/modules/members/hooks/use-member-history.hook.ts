import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';

import { buildHistoryItems } from '../helpers/history-view.helper';
import { buildMemberHistoryQueryOptions } from '../queries/member-history.query';
import type { HistoryPanelView } from '../types/members-view.types';

/** Status-history timeline panel (visible only to lifecycle managers). */
export function useMemberHistory(
  teamId: string,
  membershipId: string,
  canView: boolean,
): HistoryPanelView {
  const { t, locale } = useAppTranslation();
  const query = useAppQuery(buildMemberHistoryQueryOptions(teamId, membershipId, canView));
  return {
    heading: t(I18N_KEYS.members.historyHeading),
    canView,
    emptyLabel: t(I18N_KEYS.members.historyEmpty),
    items: buildHistoryItems(t, locale, query.data ?? []),
  };
}
