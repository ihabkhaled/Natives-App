import { formatCairoDateTime } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { buildScreenCopy, resolveScreenStatus, toRemoteQueryView } from '@/shared/view';

import { TRYOUT_CANDIDATES_SCREEN_COPY_KEYS } from '../constants/tryout-candidates-copy.constants';
import {
  buildCandidateDetailPanel,
  buildCandidateRows,
  resolveCandidatesPage,
} from '../helpers/candidate-view.helper';
import { buildTryoutCandidatesQueryOptions } from '../queries/tryout-candidates.query';
import { tryoutCandidatesPagePath } from '../routes/tryout-candidates.paths';
import type { TryoutCandidatesPage } from '../types/tryout-candidates.types';
import type { TryoutCandidatesScreenView } from '../types/tryout-candidates-view.types';
import { useCandidateDetail } from './use-candidate-detail.hook';
import { useCandidateWithdrawal } from './use-candidate-withdrawal.hook';
import { useTryoutCandidatesContext } from './use-tryout-candidates-context.hook';

const KEYS = I18N_KEYS.tryoutCandidates;

/**
 * View model for the candidate review screen: the redacted list, the selected
 * candidate's record with one block per read grant, and the withdrawal step.
 *
 * The list and the detail are separate reads on purpose. Restricted fields are
 * fetched for one person a reviewer deliberately opened, never for a whole page
 * of people on the chance that somebody looks.
 */
export function useTryoutCandidatesScreen(): TryoutCandidatesScreenView {
  const { t, locale } = useAppTranslation();
  const context = useTryoutCandidatesContext();
  const detail = useCandidateDetail(context.teamId);
  const withdrawal = useCandidateWithdrawal(t, context.teamId, detail.candidate);

  const query = toRemoteQueryView<TryoutCandidatesPage>(
    useAppQuery(buildTryoutCandidatesQueryOptions(context.teamId, 0)),
  );
  const page = resolveCandidatesPage(query.data);
  const formatInstant = (iso: string): string => formatCairoDateTime(iso, locale);
  const rows = buildCandidateRows(t, formatInstant, page.items, detail.selectedId);

  return {
    ...buildScreenCopy(t, {
      keys: TRYOUT_CANDIDATES_SCREEN_COPY_KEYS,
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
      emptyTitleKey: KEYS.emptyTitle,
      emptyMessageKey: KEYS.emptyMessage,
    }),
    path: tryoutCandidatesPagePath(),
    pageTitle: t(KEYS.title),
    status: resolveScreenStatus(context, query, context.canManage, rows.length > 0),
    listHeading: t(KEYS.listHeading),
    listIntro: t(KEYS.listIntro),
    listPrivacyNotice: t(I18N_KEYS.tryouts.candidatesIntro),
    countLabel: t(KEYS.countLabel, { total: page.total }),
    notice: withdrawal.notice,
    rows,
    selectPrompt: t(I18N_KEYS.tryouts.selectCandidatePrompt),
    detail:
      detail.candidate === null
        ? null
        : buildCandidateDetailPanel({
            t,
            formatInstant,
            candidate: detail.candidate,
            grants: context,
            onWithdraw: withdrawal.open,
          }),
    withdrawal: withdrawal.view,
    onSelect: detail.select,
  };
}
