import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  SQUAD_STATUS_LABEL_KEYS,
  SQUAD_STATUS_TONES,
  SQUAD_TRANSITION_LABEL_KEYS,
} from '../constants/competitions-labels.constants';
import type { SquadStatus, SquadTransition } from '../constants/competitions.constants';
import type { Squad } from '../types/competitions.types';
import type { FactRowView, SquadCardView } from '../types/competitions-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

export function buildSquadCard(
  t: Translate,
  formatInstant: (iso: string) => string,
  squad: Squad,
): SquadCardView {
  return {
    id: squad.squadId,
    name: squad.name,
    statusLabel: t(SQUAD_STATUS_LABEL_KEYS[squad.status]),
    statusTone: SQUAD_STATUS_TONES[squad.status],
    revisionLabel: `${t(I18N_KEYS.squads.revisionLabel)} ${String(squad.revision)}`,
    deadlineLabel:
      squad.selectionDeadline === null
        ? t(I18N_KEYS.squads.deadlineNone)
        : formatInstant(squad.selectionDeadline),
    thresholdLabel: `${t(I18N_KEYS.squads.thresholdLabel)}: ${String(squad.attendanceThresholdPct)}%`,
    openLabel: t(I18N_KEYS.squads.openLabel),
  };
}

export function buildSquadFacts(
  t: Translate,
  formatInstant: (iso: string) => string,
  squad: Squad,
): readonly FactRowView[] {
  return [
    {
      key: 'competition',
      label: t(I18N_KEYS.squads.competitionLabel),
      value: squad.competitionId ?? t(I18N_KEYS.squads.competitionNone),
    },
    {
      key: 'revision',
      label: t(I18N_KEYS.squads.revisionLabel),
      value: String(squad.revision),
    },
    { key: 'policy', label: t(I18N_KEYS.squads.policyLabel), value: squad.policyVersion },
    {
      key: 'threshold',
      label: t(I18N_KEYS.squads.thresholdLabel),
      value: `${String(squad.attendanceThresholdPct)}%`,
    },
    {
      key: 'deadline',
      label: t(I18N_KEYS.squads.deadlineLabel),
      value:
        squad.selectionDeadline === null
          ? t(I18N_KEYS.squads.deadlineNone)
          : formatInstant(squad.selectionDeadline),
    },
  ];
}

const TRANSITIONS_BY_STATUS: Record<SquadStatus, readonly SquadTransition[]> = {
  draft: ['publish', 'archive'],
  published: ['lock', 'revise', 'archive'],
  locked: ['revise', 'archive'],
  archived: [],
};

/**
 * Which lifecycle moves are offered. A squad that is locked can only be
 * revised or archived; a manager grant is required for all of them.
 */
export function availableTransitions(
  status: SquadStatus,
  canManage: boolean,
): readonly SquadTransition[] {
  return canManage ? TRANSITIONS_BY_STATUS[status] : [];
}

export function transitionLabel(t: Translate, transition: SquadTransition): string {
  return t(SQUAD_TRANSITION_LABEL_KEYS[transition]);
}

/** Selection is frozen while the squad is locked or archived. */
export function isSelectionFrozen(status: SquadStatus): boolean {
  return status === 'locked' || status === 'archived';
}

/** Everything the squad header renders, resolved once from a nullable record. */
export interface SquadHeadline {
  readonly heading: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly notes: string | null;
  readonly facts: readonly FactRowView[];
}

export function buildSquadHeadline(
  t: Translate,
  formatInstant: (iso: string) => string,
  squad: Squad | null,
): SquadHeadline {
  if (squad === null) {
    return {
      heading: t(I18N_KEYS.squads.detailTitle),
      statusLabel: '',
      statusTone: 'medium',
      notes: null,
      facts: [],
    };
  }
  return {
    heading: squad.name,
    statusLabel: t(SQUAD_STATUS_LABEL_KEYS[squad.status]),
    statusTone: SQUAD_STATUS_TONES[squad.status],
    notes: squad.notes,
    facts: buildSquadFacts(t, formatInstant, squad),
  };
}
