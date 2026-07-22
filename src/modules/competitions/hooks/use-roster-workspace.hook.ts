import { formatCairoDateTime } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation, useRouteParam } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { SQUADS_COPY_NAMESPACE } from '../constants/competitions-labels.constants';
import {
  buildCompetitionsScreenCopy,
  resolveCompetitionsScreenStatus,
} from '../helpers/competitions-copy.helper';
import { buildRosterHeadline, buildRosterSections } from '../helpers/roster-detail.helper';
import { useRosterEntryMutation } from '../mutations/use-roster-entry-mutation.hook';
import { ROSTER_ID_PARAM, rostersPath } from '../routes/competitions.paths';
import type { RosterDetailView } from '../types/rosters-view.types';
import { useCompetitionsContext } from './use-competitions-context.hook';
import { useRosterLifecycle } from './use-roster-lifecycle.hook';
import { useRosterReads } from './use-roster-reads.hook';

/**
 * The roster builder: policy facts, the server-side validation preview, the
 * rostered players, the lifecycle actions the status allows, and the
 * append-only snapshot history.
 */
export function useRosterWorkspace(): RosterDetailView {
  const { t, locale } = useAppTranslation();
  const context = useCompetitionsContext();
  const navigation = useAppNavigation();
  const toast = useAppToast();
  const rosterId = useRouteParam(ROSTER_ID_PARAM) ?? '';

  const reads = useRosterReads(context.teamId, rosterId);
  const headline = buildRosterHeadline(t, reads.roster);
  const formatInstant = (iso: string): string => formatCairoDateTime(iso, locale);

  const removal = useRosterEntryMutation(context.teamId, rosterId, {
    onSuccess: () => {
      void toast.showToast({ message: t(I18N_KEYS.rosters.removeDone), tone: 'success' });
    },
    onError: () => {
      void toast.showToast({ message: t(I18N_KEYS.rosters.actionFailed), tone: 'danger' });
    },
  });
  const actions = useRosterLifecycle({
    teamId: context.teamId,
    rosterId,
    roster: reads.roster,
    publishable: reads.publishable,
    canManage: context.canManageRoster,
    canLock: context.canLockRoster,
  });

  return {
    ...buildCompetitionsScreenCopy(t, {
      namespace: SQUADS_COPY_NAMESPACE,
      error: reads.query.error,
      isOffline: context.isOffline,
      onRetry: reads.query.refetch,
      emptyTitleKey: I18N_KEYS.rosters.notFoundTitle,
      emptyMessageKey: I18N_KEYS.rosters.notFoundMessage,
    }),
    title: t(I18N_KEYS.rosters.detailTitle),
    backLabel: t(I18N_KEYS.rosters.back),
    status: resolveCompetitionsScreenStatus(
      context,
      reads.query,
      context.canReadRoster,
      reads.roster !== null,
    ),
    ...headline,
    ...buildRosterSections(t, {
      locale,
      formatInstant,
      roster: reads.roster,
      entries: reads.entries,
      validation: reads.validation,
      snapshots: reads.snapshots,
      canRemoveEntries: context.canManageRoster && !headline.isLocked,
    }),
    lockedNotice: headline.isLocked ? t(I18N_KEYS.rosters.lockedNotice) : null,
    actions,
    onRemoveEntry: (membershipId: string) => {
      removal.run({ membershipId, reason: null });
    },
    onBack: () => {
      navigation.replace(rostersPath());
    },
  };
}
