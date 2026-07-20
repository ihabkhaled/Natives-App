import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  COMPETITION_STATUS_LABEL_KEYS,
  COMPETITION_STATUS_TONES,
  COMPETITION_TYPE_LABEL_KEYS,
  FIXTURE_STATUS_LABEL_KEYS,
  FIXTURE_STATUS_TONES,
  HOME_AWAY_LABEL_KEYS,
  STAGE_FORMAT_LABEL_KEYS,
} from '../constants/competitions-labels.constants';
import type {
  Competition,
  CompetitionStructure,
  Fixture,
  Opponent,
} from '../types/competitions.types';
import type {
  FactRowView,
  FixtureRowView,
  OpponentRowView,
  StageRowView,
} from '../types/competitions-view.types';
import { buildWindowLabel, orNotRecorded } from './competition-view.helper';

type Translate = (key: string, params?: TranslateParams) => string;

/** The competition's headline facts, each with an honest fallback. */
export function buildCompetitionFacts(
  t: Translate,
  format: (isoDate: string) => string,
  competition: Competition,
): readonly FactRowView[] {
  return [
    {
      key: 'window',
      label: t(I18N_KEYS.competitions.windowLabel),
      value: buildWindowLabel(t, format, competition),
    },
    {
      key: 'organizer',
      label: t(I18N_KEYS.competitions.organizerLabel),
      value: orNotRecorded(t, competition.organizerName),
    },
    {
      key: 'division',
      label: t(I18N_KEYS.competitions.divisionLabel),
      value: orNotRecorded(t, competition.genderDivision),
    },
    {
      key: 'externalRef',
      label: t(I18N_KEYS.competitions.externalRefLabel),
      value: orNotRecorded(t, competition.externalRef),
    },
  ];
}

/** Stage rows carry their own rounds so the structure reads top-down. */
export function buildStageRows(
  t: Translate,
  structure: CompetitionStructure,
): readonly StageRowView[] {
  return structure.stages.map((stage) => ({
    id: stage.stageId,
    name: stage.name,
    formatLabel: t(STAGE_FORMAT_LABEL_KEYS[stage.stageFormat]),
    ordinalLabel: String(stage.ordinal),
    roundsLabel: t(I18N_KEYS.competitions.roundsLabel),
    roundsEmptyLabel: t(I18N_KEYS.competitions.roundsEmpty),
    rounds: structure.rounds
      .filter((round) => round.stageId === stage.stageId)
      .map((round) => round.name),
  }));
}

function rescheduleNote(t: Translate, fixture: Fixture): string | null {
  if (fixture.rescheduleCount === 0) {
    return null;
  }
  return t(I18N_KEYS.competitions.rescheduleNote, {
    count: fixture.rescheduleCount,
    reason: orNotRecorded(t, fixture.rescheduleReason),
  });
}

/**
 * Fixture rows, presented in Cairo time by the caller-supplied formatter.
 * A missing opponent or venue is stated, never guessed.
 */
export function buildFixtureRows(
  t: Translate,
  formatInstant: (iso: string) => string,
  fixtures: readonly Fixture[],
  opponentNames: ReadonlyMap<string, string>,
): readonly FixtureRowView[] {
  return fixtures.map((fixture) => ({
    id: fixture.fixtureId,
    opponentName:
      opponentNames.get(fixture.opponentId) ?? t(I18N_KEYS.competitions.opponentUnknown),
    homeAwayLabel: t(HOME_AWAY_LABEL_KEYS[fixture.homeAway]),
    timeLabel: formatInstant(fixture.scheduledAt),
    statusLabel: t(FIXTURE_STATUS_LABEL_KEYS[fixture.status]),
    statusTone: FIXTURE_STATUS_TONES[fixture.status],
    venueLabel: fixture.venueId ?? t(I18N_KEYS.competitions.venueUnknown),
    rescheduleNote: rescheduleNote(t, fixture),
  }));
}

export function buildOpponentRows(
  t: Translate,
  opponents: readonly Opponent[],
): readonly OpponentRowView[] {
  return opponents.map((opponent) => ({
    id: opponent.opponentId,
    name: opponent.name,
    shortName: opponent.shortName,
    statusLabel:
      opponent.status === 'active'
        ? t(I18N_KEYS.competitions.opponentActive)
        : t(I18N_KEYS.competitions.opponentArchived),
  }));
}

/** Opponent id to display name, for the fixture rows. */
export function buildOpponentNameMap(opponents: readonly Opponent[]): ReadonlyMap<string, string> {
  return new Map(opponents.map((opponent) => [opponent.opponentId, opponent.name]));
}

/** Everything the detail header renders, resolved once from a nullable record. */
export interface CompetitionHeadline {
  readonly heading: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly typeLabel: string;
  readonly cancellationNotice: string | null;
  readonly description: string | null;
  readonly facts: readonly FactRowView[];
}

export function buildCompetitionHeadline(
  t: Translate,
  format: (isoDate: string) => string,
  competition: Competition | null,
): CompetitionHeadline {
  if (competition === null) {
    return {
      heading: t(I18N_KEYS.competitions.detailTitle),
      statusLabel: '',
      statusTone: 'medium',
      typeLabel: '',
      cancellationNotice: null,
      description: null,
      facts: [],
    };
  }
  return {
    heading: competition.name,
    statusLabel: t(COMPETITION_STATUS_LABEL_KEYS[competition.status]),
    statusTone: COMPETITION_STATUS_TONES[competition.status],
    typeLabel: t(COMPETITION_TYPE_LABEL_KEYS[competition.competitionType]),
    cancellationNotice:
      competition.cancellationReason === null
        ? null
        : t(I18N_KEYS.competitions.cancellationNotice, { reason: competition.cancellationReason }),
    description: competition.description,
    facts: buildCompetitionFacts(t, format, competition),
  };
}
