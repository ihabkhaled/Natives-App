import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  AVAILABILITY_LABEL_KEYS,
  SELECTION_ROLE_LABEL_KEYS,
} from '../constants/competitions-labels.constants';
import type {
  EligibilityCandidate,
  SquadAvailability,
  SquadSelection,
} from '../types/competitions.types';
import type {
  AvailabilityRowView,
  RosterPanelView,
  RosterRowView,
} from '../types/competitions-view.types';
import { formatAttendance, formatAvailability, formatJersey } from './eligibility-view.helper';

type Translate = (key: string, params?: TranslateParams) => string;

/** Selected membership id to its recorded squad role. */
export function buildSelectionRoleMap(
  selections: readonly SquadSelection[],
): ReadonlyMap<string, SquadSelection> {
  return new Map(
    selections
      .filter((selection) => selection.status === 'selected')
      .map((selection) => [selection.membershipId, selection]),
  );
}

/**
 * The complete match-day roster: every selected player appears, including one
 * with no jersey and no attendance history. Nothing is silently dropped and no
 * unknown value is printed as zero.
 */
export function buildRosterRows(
  t: Translate,
  candidates: readonly EligibilityCandidate[],
  selections: readonly SquadSelection[],
): readonly RosterRowView[] {
  const roles = buildSelectionRoleMap(selections);
  return candidates
    .filter((candidate) => candidate.selected || roles.has(candidate.membershipId))
    .map((candidate) => ({
      membershipId: candidate.membershipId,
      fullName: candidate.fullName,
      jerseyLabel: formatJersey(t, candidate.jerseyNumber),
      roleLabel: t(
        SELECTION_ROLE_LABEL_KEYS[roles.get(candidate.membershipId)?.selectionRole ?? 'player'],
      ),
      availabilityLabel: formatAvailability(t, candidate.availability),
      attendanceLabel: formatAttendance(t, candidate.attendancePct),
    }));
}

/** The roster table's column headers, with abbreviations expanded. */
export function buildRosterColumns(t: Translate): readonly string[] {
  return [
    t(I18N_KEYS.squads.rosterNameColumn),
    t(I18N_KEYS.squads.rosterJerseyColumn),
    t(I18N_KEYS.squads.rosterRoleColumn),
    t(I18N_KEYS.squads.rosterAvailabilityColumn),
    t(I18N_KEYS.squads.rosterAttendanceColumn),
  ];
}

/**
 * The complete roster panel. The pending notice is part of the model, so no
 * screen can render this preview as if it were a persisted roster.
 */
export function buildRosterPanel(
  t: Translate,
  candidates: readonly EligibilityCandidate[],
  selections: readonly SquadSelection[],
): RosterPanelView {
  return {
    heading: t(I18N_KEYS.squads.rosterHeading),
    intro: t(I18N_KEYS.squads.rosterIntro),
    pendingNotice: t(I18N_KEYS.squads.rosterPendingNotice),
    exportNote: t(I18N_KEYS.squads.rosterExportNote),
    emptyLabel: t(I18N_KEYS.squads.rosterEmpty),
    columns: buildRosterColumns(t),
    rows: buildRosterRows(t, candidates, selections),
  };
}

export function buildAvailabilityRows(
  t: Translate,
  entries: readonly SquadAvailability[],
): readonly AvailabilityRowView[] {
  return entries.map((entry) => ({
    key: entry.availabilityId,
    membershipId: entry.membershipId,
    availabilityLabel: t(AVAILABILITY_LABEL_KEYS[entry.availability]),
    sourceLabel:
      entry.source === 'self'
        ? t(I18N_KEYS.squads.availabilitySourceSelf)
        : t(I18N_KEYS.squads.availabilitySourceCoach),
    reason: entry.reason,
  }));
}
