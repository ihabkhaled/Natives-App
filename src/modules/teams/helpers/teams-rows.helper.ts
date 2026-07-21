import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  SEASON_STATUS_LABEL_KEYS,
  SEASON_STATUS_TONES,
  SEASON_TRANSITION_LABEL_KEYS,
  SEASON_TRANSITIONS_BY_STATUS,
  TEAM_STATUS_LABEL_KEYS,
  TEAM_STATUS_TONES,
  TEAM_TRANSITION_LABEL_KEYS,
  TEAM_TRANSITIONS_BY_STATUS,
} from '../constants/teams.constants';
import type { Season, Team } from '../types/teams.types';
import type { AdminRecordRowView, LifecycleActionView } from '../types/teams-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** What a row's controls do, injected by the owning hook. */
export interface RowActions<T> {
  readonly canManage: boolean;
  readonly onEdit: (item: T) => void;
  readonly onTransition: (item: T, transition: string) => void;
}

/**
 * The team list. The detail line carries the slug and timezone because those
 * are the two facts that disambiguate two teams sharing a display name — which
 * this deployment genuinely has.
 *
 * Only the transitions that are legal from the row's current state are offered:
 * the backend refuses the rest with `teamInvalidTransition`, and a button that
 * is guaranteed to 409 is worse than no button.
 */
export function buildTeamRows(
  t: Translate,
  teams: readonly Team[],
  actions: RowActions<Team>,
): readonly AdminRecordRowView[] {
  return teams.map((team) => ({
    key: team.id,
    label: team.name,
    value: t(TEAM_STATUS_LABEL_KEYS[team.status]),
    detail: `${team.slug} · ${team.timezone}`,
    tone: TEAM_STATUS_TONES[team.status],
    canManage: actions.canManage,
    editLabel: t(I18N_KEYS.teamsAdmin.editAction),
    onEdit: () => {
      actions.onEdit(team);
    },
    transitions: TEAM_TRANSITIONS_BY_STATUS[team.status].map((transition): LifecycleActionView => ({
      key: transition,
      label: t(TEAM_TRANSITION_LABEL_KEYS[transition]),
      onSelect: () => {
        actions.onTransition(team, transition);
      },
    })),
  }));
}

/** The season list, each row stating its window and its lifecycle state. */
export function buildSeasonRows(
  t: Translate,
  seasons: readonly Season[],
  actions: RowActions<Season>,
): readonly AdminRecordRowView[] {
  return seasons.map((season) => ({
    key: season.id,
    label: season.name,
    value: t(SEASON_STATUS_LABEL_KEYS[season.status]),
    detail: `${season.startsOn} → ${season.endsOn}`,
    tone: SEASON_STATUS_TONES[season.status],
    canManage: actions.canManage,
    editLabel: t(I18N_KEYS.seasonsAdmin.editAction),
    onEdit: () => {
      actions.onEdit(season);
    },
    transitions: SEASON_TRANSITIONS_BY_STATUS[season.status].map(
      (transition): LifecycleActionView => ({
        key: transition,
        label: t(SEASON_TRANSITION_LABEL_KEYS[transition]),
        onSelect: () => {
          actions.onTransition(season, transition);
        },
      }),
    ),
  }));
}
