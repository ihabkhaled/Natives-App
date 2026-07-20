import { formatCairoDateTime } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation, useRouteParam } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';

import { SQUADS_COPY_NAMESPACE } from '../constants/competitions-labels.constants';
import {
  buildCompetitionsScreenCopy,
  resolveCompetitionsScreenStatus,
} from '../helpers/competitions-copy.helper';
import { buildRosterPanel } from '../helpers/roster-view.helper';
import { buildSquadHeadline, isSelectionFrozen } from '../helpers/squad-view.helper';
import { SQUAD_ID_PARAM, squadsPath } from '../routes/competitions.paths';
import type { SquadDetailView } from '../types/competitions-view.types';
import { useCompetitionsContext } from './use-competitions-context.hook';
import { useSquadAvailabilityPanel } from './use-squad-availability-panel.hook';
import { useSquadEligibilityQuery } from './use-squad-eligibility-query.hook';
import { useSquadQuery } from './use-squad-query.hook';
import { useSquadSelectionPanel } from './use-squad-selection-panel.hook';
import { useSquadSelectionsQuery } from './use-squad-selections-query.hook';
import { useSquadTransitions } from './use-squad-transitions.hook';

/**
 * The squad workspace: header facts, the lifecycle actions the current status
 * allows, the advisory eligibility table, the private availability panel, and
 * the complete roster preview.
 */
export function useSquadWorkspace(): SquadDetailView {
  const { t, locale } = useAppTranslation();
  const context = useCompetitionsContext();
  const navigation = useAppNavigation();
  const squadId = useRouteParam(SQUAD_ID_PARAM) ?? '';

  const squad = useSquadQuery(context.teamId, squadId);
  const eligibility = useSquadEligibilityQuery(context.teamId, squadId);
  const selections = useSquadSelectionsQuery(context.teamId, squadId);
  const record = squad.data ?? null;
  const isLocked = record !== null && isSelectionFrozen(record.status);

  const actions = useSquadTransitions({
    teamId: context.teamId,
    squadId,
    squad: record,
    canManage: context.canManageSquads,
  });
  const eligibilityPanel = useSquadSelectionPanel({
    teamId: context.teamId,
    squadId,
    isLocked,
    canSelect: context.canManageSquads,
    canOverride: context.canOverrideEligibility,
  });
  const availabilityPanel = useSquadAvailabilityPanel({
    teamId: context.teamId,
    squadId,
    isWindowClosed: isLocked,
  });

  return {
    ...buildCompetitionsScreenCopy(t, {
      namespace: SQUADS_COPY_NAMESPACE,
      error: squad.error,
      isOffline: context.isOffline,
      onRetry: squad.refetch,
      emptyTitleKey: I18N_KEYS.squads.notFoundTitle,
      emptyMessageKey: I18N_KEYS.squads.notFoundMessage,
    }),
    ...buildSquadHeadline(t, (iso: string) => formatCairoDateTime(iso, locale), record),
    title: t(I18N_KEYS.squads.detailTitle),
    backLabel: t(I18N_KEYS.squads.back),
    status: resolveCompetitionsScreenStatus(context, squad, context.canReadSquads, record !== null),
    notesHeading: t(I18N_KEYS.squads.notesHeading),
    publishHeading: t(I18N_KEYS.squads.publishHeading),
    publishIntro: t(I18N_KEYS.squads.publishIntro),
    actions,
    eligibility: eligibilityPanel,
    availability: availabilityPanel,
    roster: buildRosterPanel(t, eligibility.data?.candidates ?? [], selections.data?.items ?? []),
    onBack: () => {
      navigation.replace(squadsPath());
    },
  };
}
