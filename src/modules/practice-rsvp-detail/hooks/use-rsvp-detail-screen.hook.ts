import { useState } from 'react';

import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import type { RsvpStatus } from '@/modules/practice';
import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

import {
  RSVP_PARTICIPANTS_MAX_PAGE_SIZE,
  RSVP_PARTICIPANTS_PAGE_SIZE,
  RSVP_STATUS_FILTER_ALL,
} from '../constants/practice-rsvp-detail.constants';
import { buildRsvpDetailView } from '../helpers/practice-rsvp-detail-view.helper';
import {
  resolveCanReadRsvpDetail,
  resolveContextLoading,
  resolveHasMoreParticipants,
  resolveIsForbidden,
  resolveIsRsvpDetailLoading,
  resolveRsvpDetailHasError,
} from '../helpers/rsvp-detail-context.helper';
import { resolveRsvpDetailPanelInput } from '../helpers/rsvp-detail-panel-mode.helper';
import {
  buildRsvpHistoryQueryOptions,
  buildRsvpParticipantsQueryOptions,
  buildRsvpSummaryQueryOptions,
} from '../queries/practice-rsvp-detail.query';
import type { RsvpDetailScreenView } from '../types/practice-rsvp-detail-view.types';
import type {
  RsvpHistory,
  RsvpParticipantsPage,
  RsvpSummary,
} from '../types/practice-rsvp-detail.types';
import { useRsvpOverridePanel } from './use-rsvp-override-panel.hook';

/**
 * The RSVP-detail screen for one practice session: the roster, the summary,
 * and the two per-member actions an override needs — the form and its
 * history, which stays visible after the override runs so the change is
 * attributable rather than a silent overwrite.
 *
 * Gated on `practice.manage`, the same grant `practice-reminders` uses: who
 * is coming, and changing that on somebody's behalf, is a coach's job. The
 * backend re-authorizes every call regardless. The open panel (override or
 * history) is owned by `useRsvpOverridePanel`; this hook only wires reads.
 */
export function useRsvpDetailScreen(sessionId: string): RsvpDetailScreenView {
  const { t, locale } = useAppTranslation();
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const [statusFilter, setStatusFilter] = useState<string>(RSVP_STATUS_FILTER_ALL);
  const [pageSize, setPageSize] = useState<number>(RSVP_PARTICIPANTS_PAGE_SIZE);

  const canManage = hasAllPermissions(permissions.permissions, [PERMISSIONS.practicesManage]);
  const contextLoading = resolveContextLoading(scope.isLoading, permissions.isLoading);
  const canRead = resolveCanReadRsvpDetail(contextLoading, canManage, sessionId);
  const params = { teamId: scope.teamId, sessionId };

  const participantsQuery = useAppQuery<RsvpParticipantsPage>({
    ...buildRsvpParticipantsQueryOptions(
      params,
      pageSize,
      statusFilter as RsvpStatus | typeof RSVP_STATUS_FILTER_ALL,
    ),
    enabled: canRead,
  });
  const summaryQuery = useAppQuery<RsvpSummary>({
    ...buildRsvpSummaryQueryOptions(params),
    enabled: canRead,
  });

  const panelController = useRsvpOverridePanel({ teamId: scope.teamId, sessionId });
  const historyQuery = useAppQuery<RsvpHistory>({
    ...buildRsvpHistoryQueryOptions(params, panelController.historyMembershipId),
    enabled: canRead && panelController.historyMembershipId !== '',
  });

  const panel = resolveRsvpDetailPanelInput({
    mode: panelController.mode,
    draft: panelController.draft,
    isSubmitting: panelController.isSubmitting,
    draftActions: panelController.draftActions,
    historyItems: historyQuery.data?.items ?? [],
    isHistoryLoading: historyQuery.isPending,
    onClosePanel: panelController.onClosePanel,
  });

  return buildRsvpDetailView(t, {
    locale,
    isLoading: resolveIsRsvpDetailLoading(
      contextLoading,
      participantsQuery.isPending,
      summaryQuery.isPending,
    ),
    isForbidden: resolveIsForbidden(permissions.isLoading, canManage),
    hasError: resolveRsvpDetailHasError(participantsQuery.isError, summaryQuery.isError),
    summary: summaryQuery.data,
    participants: participantsQuery.data?.items ?? [],
    total: participantsQuery.data?.total ?? 0,
    statusFilter,
    onStatusFilterChange: (value) => {
      setStatusFilter(value);
      setPageSize(RSVP_PARTICIPANTS_PAGE_SIZE);
    },
    hasMore: resolveHasMoreParticipants(
      participantsQuery.data,
      pageSize,
      RSVP_PARTICIPANTS_MAX_PAGE_SIZE,
    ),
    isLoadingMore: participantsQuery.isFetching,
    onLoadMore: () => {
      setPageSize((size) => Math.min(size + RSVP_PARTICIPANTS_PAGE_SIZE, RSVP_PARTICIPANTS_MAX_PAGE_SIZE));
    },
    rosterActions: panelController.rosterActions,
    panel,
  });
}
