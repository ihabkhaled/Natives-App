import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { AVAILABILITY_LABEL_KEYS } from '../constants/competitions-labels.constants';
import { buildValidationPanel } from './roster-validation.helper';
import {
  ENTRY_ROLE_LABEL_KEYS,
  GENDER_LABEL_KEYS,
  LINE_LABEL_KEYS,
  POSITION_LABEL_KEYS,
  ROSTER_DIVISION_LABEL_KEYS,
  ROSTER_KIND_LABEL_KEYS,
  rosterStatusLabelKey,
  rosterStatusTone,
  SNAPSHOT_REASON_LABEL_KEYS,
} from '../constants/rosters-labels.constants';
import type { RosterStatus } from '../constants/rosters.constants';
import type { FactRowView } from '../types/competitions-view.types';
import type {
  RosterCardView,
  RosterEntryRowView,
  RosterHistoryRowView,
  RosterValidationPanelView,
} from '../types/rosters-view.types';
import type { Roster, RosterEntry, RosterSnapshot, RosterValidation } from '../types/rosters.types';

type Translate = (key: string, params?: TranslateParams) => string;

export function buildRosterCard(t: Translate, roster: Roster): RosterCardView {
  return {
    id: roster.rosterId,
    name: roster.name,
    kindLabel: t(ROSTER_KIND_LABEL_KEYS[roster.rosterKind]),
    statusLabel: t(rosterStatusLabelKey(roster.status)),
    statusTone: rosterStatusTone(roster.status),
    divisionLabel: t(ROSTER_DIVISION_LABEL_KEYS[roster.division]),
    sizeLabel: t(I18N_KEYS.rosters.sizeRange, { min: roster.minSize, max: roster.maxSize }),
    revisionLabel: `${t(I18N_KEYS.rosters.revisionLabel)} ${String(roster.revision)}`,
    openLabel: t(I18N_KEYS.rosters.openLabel),
  };
}

/** Everything the roster header renders, resolved once from a nullable record. */
export interface RosterHeadline {
  readonly heading: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly notes: string | null;
  readonly isLocked: boolean;
}

export function buildRosterHeadline(t: Translate, roster: Roster | null): RosterHeadline {
  if (roster === null) {
    return {
      heading: t(I18N_KEYS.rosters.detailTitle),
      statusLabel: '',
      statusTone: 'medium',
      notes: null,
      isLocked: false,
    };
  }
  return {
    heading: roster.name,
    statusLabel: t(rosterStatusLabelKey(roster.status)),
    statusTone: rosterStatusTone(roster.status),
    notes: roster.notes,
    isLocked: roster.status === 'locked' || roster.status === 'archived',
  };
}

/** The roster's policy, resolved once. A null minimum says so, never 0. */
export function buildRosterFacts(
  t: Translate,
  formatInstant: (iso: string) => string,
  roster: Roster | null,
): readonly FactRowView[] {
  if (roster === null) {
    return [];
  }
  return [
    {
      key: 'kind',
      label: t(I18N_KEYS.rosters.kindFilterLabel),
      value: t(ROSTER_KIND_LABEL_KEYS[roster.rosterKind]),
    },
    {
      key: 'division',
      label: t(I18N_KEYS.rosters.divisionLabel),
      value: t(ROSTER_DIVISION_LABEL_KEYS[roster.division]),
    },
    {
      key: 'size',
      label: t(I18N_KEYS.rosters.sizeLabel),
      value: t(I18N_KEYS.rosters.sizeRange, { min: roster.minSize, max: roster.maxSize }),
    },
    {
      key: 'minWomen',
      label: t(I18N_KEYS.rosters.minWomenLabel),
      value: roster.minWomen === null ? t(I18N_KEYS.rosters.minWomenNone) : String(roster.minWomen),
    },
    {
      key: 'captain',
      label: t(I18N_KEYS.rosters.roleCaptain),
      value: roster.requireCaptain
        ? t(I18N_KEYS.rosters.captainRequired)
        : t(I18N_KEYS.rosters.captainOptional),
    },
    { key: 'policy', label: t(I18N_KEYS.rosters.policyLabel), value: roster.policyVersion },
    {
      key: 'deadline',
      label: t(I18N_KEYS.rosters.deadlineLabel),
      value:
        roster.selectionDeadline === null
          ? t(I18N_KEYS.rosters.deadlineNone)
          : formatInstant(roster.selectionDeadline),
    },
  ];
}

/** The roster table, with every unrecorded value spelled out. */
export function buildEntryRows(
  t: Translate,
  entries: readonly RosterEntry[],
  canManage: boolean,
): readonly RosterEntryRowView[] {
  return entries
    .filter((entry) => entry.status === 'selected')
    .map((entry) => ({
      entryId: entry.entryId,
      membershipId: entry.membershipId,
      jerseyLabel:
        entry.jerseyNumber === null ? t(I18N_KEYS.rosters.jerseyNone) : String(entry.jerseyNumber),
      roleLabel: t(ENTRY_ROLE_LABEL_KEYS[entry.entryRole]),
      lineLabel: t(LINE_LABEL_KEYS[entry.lineAssignment]),
      positionLabel: t(POSITION_LABEL_KEYS[entry.fieldPosition]),
      divisionLabel: t(GENDER_LABEL_KEYS[entry.genderBucket]),
      availabilityLabel:
        entry.availability === null
          ? t(I18N_KEYS.rosters.availabilityUnknown)
          : t(AVAILABILITY_LABEL_KEYS[entry.availability]),
      overrideNote: entry.constraintOverridden
        ? t(I18N_KEYS.rosters.overrideNote, {
            reason: entry.overrideReason ?? t(I18N_KEYS.competitions.notRecorded),
          })
        : null,
      removeLabel: t(I18N_KEYS.rosters.removeLabel),
      isRemovable: canManage,
    }));
}

export function buildEntryColumns(t: Translate): readonly string[] {
  return [
    t(I18N_KEYS.rosters.columnPlayer),
    t(I18N_KEYS.rosters.columnJersey),
    t(I18N_KEYS.rosters.columnRole),
    t(I18N_KEYS.rosters.columnLine),
    t(I18N_KEYS.rosters.columnPosition),
    t(I18N_KEYS.rosters.columnDivision),
    t(I18N_KEYS.rosters.columnAvailability),
    t(I18N_KEYS.rosters.columnActions),
  ];
}

export function buildHistoryRows(
  t: Translate,
  formatInstant: (iso: string) => string,
  snapshots: readonly RosterSnapshot[],
): readonly RosterHistoryRowView[] {
  return snapshots.map((snapshot) => ({
    key: snapshot.snapshotId,
    label: `${t(SNAPSHOT_REASON_LABEL_KEYS[snapshot.reason])} · ${t(
      I18N_KEYS.rosters.revisionLabel,
    )} ${String(snapshot.revision)}`,
    timeLabel: formatInstant(snapshot.takenAt),
    entryCountLabel: t(I18N_KEYS.rosters.historyEntryCount, { count: snapshot.entryCount }),
  }));
}

const ACTIONS_BY_STATUS: Record<RosterStatus, readonly ('publish' | 'lock' | 'archive')[]> = {
  draft: ['publish', 'archive'],
  published: ['lock', 'archive'],
  revised: ['publish', 'archive'],
  locked: ['archive'],
  archived: [],
};

/**
 * Lock is offered only to a holder of `roster.lock`; publish and archive need
 * `roster.manage`. A roster that cannot pass validation cannot be published.
 */
export function availableRosterActions(
  status: RosterStatus,
  grants: { readonly canManage: boolean; readonly canLock: boolean },
  publishable: boolean,
): readonly ('publish' | 'lock' | 'archive')[] {
  return ACTIONS_BY_STATUS[status].filter((action) => {
    if (action === 'lock') {
      return grants.canLock;
    }
    if (action === 'publish') {
      return grants.canManage && publishable;
    }
    return grants.canManage;
  });
}

/** Everything the roster body renders, assembled from four nullable reads. */
export interface RosterSectionsInput {
  readonly formatInstant: (iso: string) => string;
  readonly roster: Roster | null;
  readonly entries: readonly RosterEntry[];
  readonly validation: RosterValidation | null;
  readonly snapshots: readonly RosterSnapshot[];
  readonly canRemoveEntries: boolean;
}

export interface RosterSections {
  readonly facts: readonly FactRowView[];
  readonly lifecycleHeading: string;
  readonly lifecycleIntro: string;
  readonly validation: RosterValidationPanelView;
  readonly entriesHeading: string;
  readonly entriesIntro: string;
  readonly entriesEmptyLabel: string;
  readonly entriesColumns: readonly string[];
  readonly entries: readonly RosterEntryRowView[];
  readonly historyHeading: string;
  readonly historyEmptyLabel: string;
  readonly history: readonly RosterHistoryRowView[];
}

export function buildRosterSections(t: Translate, input: RosterSectionsInput): RosterSections {
  return {
    facts: buildRosterFacts(t, input.formatInstant, input.roster),
    lifecycleHeading: t(I18N_KEYS.rosters.lifecycleHeading),
    lifecycleIntro: t(I18N_KEYS.rosters.lifecycleIntro),
    validation: buildValidationPanel(t, input.validation),
    entriesHeading: t(I18N_KEYS.rosters.entriesHeading),
    entriesIntro: t(I18N_KEYS.rosters.entriesIntro),
    entriesEmptyLabel: t(I18N_KEYS.rosters.entriesEmpty),
    entriesColumns: buildEntryColumns(t),
    entries: buildEntryRows(t, input.entries, input.canRemoveEntries),
    historyHeading: t(I18N_KEYS.rosters.historyHeading),
    historyEmptyLabel: t(I18N_KEYS.rosters.historyEmpty),
    history: buildHistoryRows(t, input.formatInstant, input.snapshots),
  };
}
