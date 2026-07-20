import { formatCairoDateTime, formatDate } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation, useRouteParam } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';

import { COMPETITIONS_COPY_NAMESPACE } from '../constants/competitions-labels.constants';
import { EMPTY_STRUCTURE } from '../constants/competitions.constants';
import {
  buildCompetitionHeadline,
  buildFixtureRows,
  buildOpponentNameMap,
  buildOpponentRows,
  buildStageRows,
} from '../helpers/competition-detail.helper';
import {
  buildCompetitionsScreenCopy,
  resolveCompetitionsScreenStatus,
} from '../helpers/competitions-copy.helper';
import { COMPETITION_ID_PARAM, competitionsPath } from '../routes/competitions.paths';
import type { CompetitionDetailView } from '../types/competitions-view.types';
import { useCompetitionFixturesQuery } from './use-competition-fixtures-query.hook';
import { useCompetitionQuery } from './use-competition-query.hook';
import { useCompetitionStructureQuery } from './use-competition-structure-query.hook';
import { useCompetitionsContext } from './use-competitions-context.hook';
import { useOpponentsQuery } from './use-opponents-query.hook';

/**
 * Prepared, translated view model for one competition: its facts, published
 * stages and rounds, fixtures in Cairo time, and the opponent directory.
 */
export function useCompetitionDetail(): CompetitionDetailView {
  const { t, locale } = useAppTranslation();
  const context = useCompetitionsContext();
  const navigation = useAppNavigation();
  const competitionId = useRouteParam(COMPETITION_ID_PARAM) ?? '';

  const competition = useCompetitionQuery(context.teamId, competitionId);
  const structure = useCompetitionStructureQuery(context.teamId, competitionId);
  const fixtures = useCompetitionFixturesQuery(context.teamId, competitionId);
  const opponents = useOpponentsQuery(context.teamId);

  const record = competition.data ?? null;
  const opponentItems = opponents.data?.items ?? [];
  const headline = buildCompetitionHeadline(
    t,
    (isoDate: string) => formatDate(isoDate, locale),
    record,
  );

  return {
    ...buildCompetitionsScreenCopy(t, {
      namespace: COMPETITIONS_COPY_NAMESPACE,
      error: competition.error,
      isOffline: context.isOffline,
      onRetry: competition.refetch,
      emptyTitleKey: I18N_KEYS.competitions.notFoundTitle,
      emptyMessageKey: I18N_KEYS.competitions.notFoundMessage,
    }),
    ...headline,
    title: t(I18N_KEYS.competitions.detailTitle),
    backLabel: t(I18N_KEYS.competitions.back),
    status: resolveCompetitionsScreenStatus(
      context,
      competition,
      context.canReadCompetitions,
      record !== null,
    ),
    summaryHeading: t(I18N_KEYS.competitions.summaryHeading),
    descriptionHeading: t(I18N_KEYS.competitions.descriptionHeading),
    stagesHeading: t(I18N_KEYS.competitions.stagesHeading),
    stagesIntro: t(I18N_KEYS.competitions.stagesIntro),
    stagesEmptyLabel: t(I18N_KEYS.competitions.stagesEmpty),
    stages: buildStageRows(t, structure.data ?? EMPTY_STRUCTURE),
    fixturesHeading: t(I18N_KEYS.competitions.fixturesHeading),
    fixturesIntro: t(I18N_KEYS.competitions.fixturesIntro),
    fixturesEmptyLabel: t(I18N_KEYS.competitions.fixturesEmpty),
    fixtures: buildFixtureRows(
      t,
      (iso: string) => formatCairoDateTime(iso, locale),
      fixtures.data?.items ?? [],
      buildOpponentNameMap(opponentItems),
    ),
    opponentsHeading: t(I18N_KEYS.competitions.opponentsHeading),
    opponentsIntro: t(I18N_KEYS.competitions.opponentsIntro),
    opponentsEmptyLabel: t(I18N_KEYS.competitions.opponentsEmpty),
    opponents: buildOpponentRows(t, opponentItems),
    onBack: () => {
      navigation.replace(competitionsPath());
    },
  };
}
