import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type { PointsHistoryBody } from '../types/points-view.types';
import type { PointsSummary } from '../types/points.types';
import {
  buildBadgeCandidates,
  buildBadges,
  buildCategoryChart,
  buildLedgerEntries,
} from './ledger-view.helper';

type Translate = (key: string, params?: TranslateParams) => string;

/**
 * The personal ledger's body: the server total, every append-only entry, the
 * awarded badges, the candidate thresholds ahead, and the category chart.
 * An absent summary yields empty lists rather than invented numbers.
 */
export function buildPointsHistoryBody(
  t: Translate,
  locale: string,
  summary: PointsSummary | null,
): PointsHistoryBody {
  const entries = summary?.entries ?? [];
  const badges = summary?.badges ?? [];
  const total = summary?.total ?? 0;
  return {
    totalHeading: t(I18N_KEYS.points.totalHeading),
    totalText: String(total),
    ledgerHeading: t(I18N_KEYS.points.ledgerHeading),
    ledgerIntro: t(I18N_KEYS.points.ledgerIntro),
    ledgerEmptyLabel: t(I18N_KEYS.points.ledgerEmpty),
    appendOnlyNotice: t(I18N_KEYS.points.appendOnlyNotice),
    entries: buildLedgerEntries(t, locale, entries),
    hasEntries: entries.length > 0,
    badgesHeading: t(I18N_KEYS.points.badgesHeading),
    badgesIntro: t(I18N_KEYS.points.badgesIntro),
    badgesEmptyLabel: t(I18N_KEYS.points.badgesEmpty),
    badges: buildBadges(t, locale, badges),
    candidateHeading: t(I18N_KEYS.points.badgeCandidateHeading),
    candidateIntro: t(I18N_KEYS.points.badgeCandidateIntro),
    candidates: buildBadgeCandidates(t, total, badges),
    chart: buildCategoryChart(t, entries),
  };
}
