import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  COMPETITION_STATUS_LABEL_KEYS,
  COMPETITION_STATUS_TONES,
  COMPETITION_TYPE_LABEL_KEYS,
} from '../constants/competitions-labels.constants';
import { ALL_FILTER } from '../constants/competitions.constants';
import type { Competition } from '../types/competitions.types';
import type { CompetitionCardView, CompetitionsOption } from '../types/competitions-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** "All" plus one option per vocabulary value, translated through its key map. */
export function buildFilterOptions(
  t: Translate,
  values: readonly string[],
  labelKeys: Record<string, string>,
  allLabelKey: string,
): readonly CompetitionsOption[] {
  return [
    { value: ALL_FILTER, label: t(allLabelKey) },
    ...values.map((value) => ({ value, label: t(labelKeys[value] ?? value) })),
  ];
}

/** Client-side narrowing over the loaded bounded page. */
export function matchesFilter(value: string, filter: string): boolean {
  return filter === ALL_FILTER || value === filter;
}

/**
 * The competition window. A competition with no published dates says so
 * rather than rendering an empty range or a fabricated day.
 */
export function buildWindowLabel(
  t: Translate,
  format: (isoDate: string) => string,
  competition: Competition,
): string {
  if (competition.startsOn === null && competition.endsOn === null) {
    return t(I18N_KEYS.competitions.windowOpenEnded);
  }
  const start = competition.startsOn === null ? '—' : format(competition.startsOn);
  const end = competition.endsOn === null ? '—' : format(competition.endsOn);
  return `${start} – ${end}`;
}

/** A nullable free-text field, or the honest "not recorded" placeholder. */
export function orNotRecorded(t: Translate, value: string | null): string {
  return value === null || value.trim() === '' ? t(I18N_KEYS.competitions.notRecorded) : value;
}

export function buildCompetitionCard(
  t: Translate,
  format: (isoDate: string) => string,
  competition: Competition,
): CompetitionCardView {
  return {
    id: competition.competitionId,
    name: competition.name,
    typeLabel: t(COMPETITION_TYPE_LABEL_KEYS[competition.competitionType]),
    statusLabel: t(COMPETITION_STATUS_LABEL_KEYS[competition.status]),
    statusTone: COMPETITION_STATUS_TONES[competition.status],
    windowLabel: buildWindowLabel(t, format, competition),
    organizerLabel: orNotRecorded(t, competition.organizerName),
    divisionLabel: orNotRecorded(t, competition.genderDivision),
    openLabel: t(I18N_KEYS.competitions.openLabel),
  };
}
