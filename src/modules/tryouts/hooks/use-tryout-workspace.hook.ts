import { useState } from 'react';

import { formatCairoDateTime } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation, useRouteParam } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { ALL_CANDIDATES_FILTER } from '../constants/tryouts.constants';
import {
  buildCandidateRow,
  buildCandidateStatusOptions,
  buildTryoutFacts,
  buildTryoutHeadline,
} from '../helpers/candidate-view.helper';
import { buildTryoutsScreenCopy, resolveTryoutsScreenStatus } from '../helpers/tryouts-copy.helper';
import { useCheckInMutation } from '../mutations/use-check-in-mutation.hook';
import { TRYOUT_ID_PARAM, tryoutsPath } from '../routes/tryouts.paths';
import type { TryoutDetailView } from '../types/tryouts-view.types';
import { useCandidatePanel } from './use-candidate-panel.hook';
import { useTryoutCandidateQuery } from './use-tryout-candidate-query.hook';
import { useTryoutCandidatesQuery } from './use-tryout-candidates-query.hook';
import { useTryoutQuery } from './use-tryout-query.hook';
import { useTryoutsContext } from './use-tryouts-context.hook';

/**
 * The staff tryout workspace: the privacy-safe candidate list with check-in,
 * and the selected candidate's restricted detail, evaluation, decision, and
 * conversion panels.
 */
export function useTryoutWorkspace(): TryoutDetailView {
  const { t, locale } = useAppTranslation();
  const context = useTryoutsContext();
  const navigation = useAppNavigation();
  const toast = useAppToast();
  const tryoutId = useRouteParam(TRYOUT_ID_PARAM) ?? '';
  const [statusFilter, setStatusFilter] = useState<string>(ALL_CANDIDATES_FILTER);
  const [selectedId, setSelectedId] = useState('');

  const event = useTryoutQuery(context.teamId, tryoutId);
  const candidates = useTryoutCandidatesQuery(context.teamId, tryoutId);
  const detail = useTryoutCandidateQuery(context.teamId, tryoutId, selectedId);

  const items = candidates.data?.items ?? [];
  const matches = items.filter(
    (item) => statusFilter === ALL_CANDIDATES_FILTER || item.status === statusFilter,
  );
  const formatInstant = (iso: string): string => formatCairoDateTime(iso, locale);

  const checkIn = useCheckInMutation(context.teamId, tryoutId, {
    onSuccess: () => {
      void toast.showToast({ message: t(I18N_KEYS.tryouts.checkInDone), tone: 'success' });
    },
    onError: () => {
      void toast.showToast({ message: t(I18N_KEYS.tryouts.actionFailed), tone: 'danger' });
    },
  });

  const record = event.data ?? null;
  const panel = useCandidatePanel({
    tryoutId,
    detail: detail.data ?? null,
    context,
  });

  return {
    ...buildTryoutsScreenCopy(t, {
      error: event.error,
      isOffline: context.isOffline,
      onRetry: event.refetch,
      emptyTitleKey: I18N_KEYS.tryouts.notFoundTitle,
      emptyMessageKey: I18N_KEYS.tryouts.notFoundMessage,
    }),
    title: t(I18N_KEYS.tryouts.detailTitle),
    backLabel: t(I18N_KEYS.tryouts.back),
    status: resolveTryoutsScreenStatus(context, event, context.canManage, record !== null),
    backendPendingNotice: t(I18N_KEYS.tryouts.backendPendingNotice),
    ...buildTryoutHeadline(t, record),
    facts: buildTryoutFacts(t, formatInstant, record),
    candidatesHeading: t(I18N_KEYS.tryouts.candidatesHeading),
    candidatesIntro: t(I18N_KEYS.tryouts.candidatesIntro),
    candidatesEmptyLabel: t(I18N_KEYS.tryouts.candidatesEmpty),
    statusFilterLabel: t(I18N_KEYS.tryouts.candidateStatusFilterLabel),
    statusFilter,
    statusOptions: buildCandidateStatusOptions(t),
    countLabel: t(I18N_KEYS.tryouts.countSummary, {
      shown: matches.length,
      total: candidates.data?.total ?? 0,
    }),
    rows: matches.map((item) => buildCandidateRow(t, formatInstant, item, selectedId)),
    selectPrompt: t(I18N_KEYS.tryouts.selectCandidatePrompt),
    panel,
    onStatusFilterChange: setStatusFilter,
    onSelect: setSelectedId,
    onCheckIn: checkIn.run,
    onBack: () => {
      navigation.replace(tryoutsPath());
    },
  };
}
