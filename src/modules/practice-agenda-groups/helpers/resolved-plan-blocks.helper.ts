import type { AgendaBlock, AgendaStation } from '@/modules/practice-agenda';
import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type { AgendaGroup } from '../types/practice-agenda-groups.types';
import type {
  ResolvedBlockView,
  ResolvedStationView,
} from '../types/practice-agenda-groups-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

function buildGroupNameLookup(groups: readonly AgendaGroup[]): ReadonlyMap<string, string> {
  return new Map(groups.map((group) => [group.id, group.name]));
}

/** A station with no `groupId`, or one whose group has since been removed, reads as unassigned. */
function toResolvedStation(
  station: AgendaStation,
  groupNames: ReadonlyMap<string, string>,
  unassignedLabel: string,
): ResolvedStationView {
  return {
    id: station.id,
    name: station.name,
    target: station.target,
    groupLabel:
      station.groupId === null
        ? unassignedLabel
        : (groupNames.get(station.groupId) ?? unassignedLabel),
  };
}

/**
 * The plan resolved: every station's `groupId` turned into the group's name,
 * the way a coach actually reads it. Read-only — editing a block or a station
 * belongs to `practice-agenda`, which already owns that command.
 *
 * `durationMinutes: null` produces no duration label at all; the backend
 * distinguishes a block nobody has timed from a zero-length one, and so does
 * this view.
 */
export function buildResolvedBlockViews(
  t: Translate,
  blocks: readonly AgendaBlock[],
  groups: readonly AgendaGroup[],
): readonly ResolvedBlockView[] {
  const groupNames = buildGroupNameLookup(groups);
  const unassignedLabel = t(I18N_KEYS.practiceAgendaGroups.unassigned);
  return [...blocks]
    .sort((left, right) => left.position - right.position)
    .map((block) => ({
      id: block.id,
      title: block.title,
      durationLabel:
        block.durationMinutes === null
          ? null
          : t(I18N_KEYS.practice.agendaDuration, { minutes: block.durationMinutes }),
      stations: [...block.stations]
        .sort((left, right) => left.position - right.position)
        .map((station) => toResolvedStation(station, groupNames, unassignedLabel)),
    }));
}
