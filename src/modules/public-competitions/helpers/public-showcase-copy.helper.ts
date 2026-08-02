import type { AppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { MATCH_OUTCOME } from '../constants/public-showcase.constants';
import type {
  PublicCompetitionsLabels,
  PublicLeaderboardLabels,
  PublicMatchesLabels,
} from '../types/public-competitions-view.types';

type Translate = AppTranslation['t'];

const KEYS = I18N_KEYS.publicCompetitions;

/** The five designed states' i18n keys, shared by both showcase screens. */
export const PUBLIC_SHOWCASE_COPY_KEYS = {
  loadingLabel: KEYS.loading,
  errorTitle: KEYS.errorTitle,
  errorMessage: KEYS.errorMessage,
  retry: KEYS.retry,
  offlineTitle: KEYS.offlineTitle,
  offlineMessage: KEYS.offlineMessage,
  forbiddenTitle: KEYS.forbiddenTitle,
  forbiddenMessage: KEYS.forbiddenMessage,
};

/** Card copy shared by the list cards and the detail header. */
export function buildPublicCompetitionsLabels(t: Translate): PublicCompetitionsLabels {
  return {
    yearLabel: t(KEYS.yearLabel),
    formatLabel: t(KEYS.formatLabel),
    locationLabel: t(KEYS.locationLabel),
    datesLabel: t(KEYS.datesLabel),
    finishLabel: t(KEYS.finishLabel),
    finishPending: t(KEYS.finishPending),
    notPublished: t(KEYS.notPublished),
    openDetail: t(KEYS.openDetail),
  };
}

/** Match-results table copy, including the outcome word per outcome token. */
export function buildPublicMatchesLabels(t: Translate): PublicMatchesLabels {
  return {
    caption: t(KEYS.matchesCaption),
    columnOpponent: t(KEYS.columnOpponent),
    columnScore: t(KEYS.columnScore),
    columnDate: t(KEYS.columnDate),
    columnOutcome: t(KEYS.columnOutcome),
    outcomes: {
      [MATCH_OUTCOME.Win]: t(KEYS.outcomeWin),
      [MATCH_OUTCOME.Loss]: t(KEYS.outcomeLoss),
      [MATCH_OUTCOME.Draw]: t(KEYS.outcomeDraw),
      [MATCH_OUTCOME.Pending]: t(KEYS.outcomePending),
    },
    scorePending: t(KEYS.scorePending),
    datePending: t(KEYS.datePending),
    showPlayers: t(KEYS.showPlayers),
    hidePlayers: t(KEYS.hidePlayers),
    playersCaption: t(KEYS.playersCaption),
    playersEmpty: t(KEYS.playersEmpty),
    columnPlayer: t(KEYS.columnPlayer),
    columnGoals: t(KEYS.columnGoals),
    columnAssists: t(KEYS.columnAssists),
    columnBlocks: t(KEYS.columnBlocks),
    emptyTitle: t(KEYS.matchesEmptyTitle),
    emptyMessage: t(KEYS.matchesEmptyMessage),
  };
}

/** Individual leaderboard copy. */
export function buildPublicLeaderboardLabels(t: Translate): PublicLeaderboardLabels {
  return {
    caption: t(KEYS.leaderboardCaption),
    columnRank: t(KEYS.columnRank),
    columnPlayer: t(KEYS.columnPlayer),
    columnPoints: t(KEYS.columnPoints),
    emptyTitle: t(KEYS.leaderboardEmptyTitle),
    emptyMessage: t(KEYS.leaderboardEmptyMessage),
  };
}
