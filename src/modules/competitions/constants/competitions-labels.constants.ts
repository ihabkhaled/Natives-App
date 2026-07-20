import { I18N_KEYS } from '@/shared/i18n';

import type { ScreenCopyNamespace } from '../types/competitions-view.types';
import type {
  AvailabilityValue,
  CompetitionStatus,
  CompetitionType,
  EligibilitySignalCode,
  EligibilityStatus,
  FixtureStatus,
  HomeAway,
  SelectionRole,
  SquadStatus,
  SquadTransition,
  StageFormat,
} from './competitions.constants';

/** The shared async-state copy each screen family draws from. */
export const COMPETITIONS_COPY_NAMESPACE: ScreenCopyNamespace = {
  loadingLabel: I18N_KEYS.competitions.loadingLabel,
  errorTitle: I18N_KEYS.competitions.errorTitle,
  errorMessage: I18N_KEYS.competitions.errorMessage,
  retry: I18N_KEYS.competitions.retry,
  offlineTitle: I18N_KEYS.competitions.offlineTitle,
  offlineMessage: I18N_KEYS.competitions.offlineMessage,
  forbiddenTitle: I18N_KEYS.competitions.forbiddenTitle,
  forbiddenMessage: I18N_KEYS.competitions.forbiddenMessage,
};

export const SQUADS_COPY_NAMESPACE: ScreenCopyNamespace = {
  loadingLabel: I18N_KEYS.squads.loadingLabel,
  errorTitle: I18N_KEYS.squads.errorTitle,
  errorMessage: I18N_KEYS.squads.errorMessage,
  retry: I18N_KEYS.squads.retry,
  offlineTitle: I18N_KEYS.squads.offlineTitle,
  offlineMessage: I18N_KEYS.squads.offlineMessage,
  forbiddenTitle: I18N_KEYS.squads.forbiddenTitle,
  forbiddenMessage: I18N_KEYS.squads.forbiddenMessage,
};

/** Translation keys and presentation tones for every competition vocabulary. */
export const COMPETITION_STATUS_LABEL_KEYS: Record<CompetitionStatus, string> = {
  draft: I18N_KEYS.competitions.statusDraft,
  published: I18N_KEYS.competitions.statusPublished,
  active: I18N_KEYS.competitions.statusActive,
  completed: I18N_KEYS.competitions.statusCompleted,
  cancelled: I18N_KEYS.competitions.statusCancelled,
  archived: I18N_KEYS.competitions.statusArchived,
};

export const COMPETITION_STATUS_TONES: Record<CompetitionStatus, string> = {
  draft: 'medium',
  published: 'primary',
  active: 'success',
  completed: 'medium',
  cancelled: 'danger',
  archived: 'medium',
};

export const COMPETITION_TYPE_LABEL_KEYS: Record<CompetitionType, string> = {
  league: I18N_KEYS.competitions.typeLeague,
  championship: I18N_KEYS.competitions.typeChampionship,
  tournament: I18N_KEYS.competitions.typeTournament,
  friendly: I18N_KEYS.competitions.typeFriendly,
  custom: I18N_KEYS.competitions.typeCustom,
};

export const STAGE_FORMAT_LABEL_KEYS: Record<StageFormat, string> = {
  group: I18N_KEYS.competitions.stageFormatGroup,
  pool: I18N_KEYS.competitions.stageFormatPool,
  bracket: I18N_KEYS.competitions.stageFormatBracket,
  knockout: I18N_KEYS.competitions.stageFormatKnockout,
  round_robin: I18N_KEYS.competitions.stageFormatRoundRobin,
};

export const FIXTURE_STATUS_LABEL_KEYS: Record<FixtureStatus, string> = {
  scheduled: I18N_KEYS.competitions.fixtureStatusScheduled,
  rescheduled: I18N_KEYS.competitions.fixtureStatusRescheduled,
  ready: I18N_KEYS.competitions.fixtureStatusReady,
  live: I18N_KEYS.competitions.fixtureStatusLive,
  final: I18N_KEYS.competitions.fixtureStatusFinal,
  abandoned: I18N_KEYS.competitions.fixtureStatusAbandoned,
  cancelled: I18N_KEYS.competitions.fixtureStatusCancelled,
};

export const FIXTURE_STATUS_TONES: Record<FixtureStatus, string> = {
  scheduled: 'primary',
  rescheduled: 'warning',
  ready: 'primary',
  live: 'success',
  final: 'medium',
  abandoned: 'danger',
  cancelled: 'danger',
};

export const HOME_AWAY_LABEL_KEYS: Record<HomeAway, string> = {
  home: I18N_KEYS.competitions.fixtureHome,
  away: I18N_KEYS.competitions.fixtureAway,
  neutral: I18N_KEYS.competitions.fixtureNeutral,
};

export const SQUAD_STATUS_LABEL_KEYS: Record<SquadStatus, string> = {
  draft: I18N_KEYS.squads.statusDraft,
  published: I18N_KEYS.squads.statusPublished,
  locked: I18N_KEYS.squads.statusLocked,
  archived: I18N_KEYS.squads.statusArchived,
};

export const SQUAD_STATUS_TONES: Record<SquadStatus, string> = {
  draft: 'medium',
  published: 'success',
  locked: 'warning',
  archived: 'medium',
};

export const SIGNAL_CODE_LABEL_KEYS: Record<EligibilitySignalCode, string> = {
  active_status: I18N_KEYS.squads.signalActiveStatus,
  registration: I18N_KEYS.squads.signalRegistration,
  attendance: I18N_KEYS.squads.signalAttendance,
  availability: I18N_KEYS.squads.signalAvailability,
  injury: I18N_KEYS.squads.signalInjury,
  jersey: I18N_KEYS.squads.signalJersey,
};

export const SIGNAL_STATUS_LABEL_KEYS: Record<EligibilityStatus, string> = {
  passed: I18N_KEYS.squads.signalPassed,
  warning: I18N_KEYS.squads.signalWarning,
  failed: I18N_KEYS.squads.signalFailed,
  unknown: I18N_KEYS.squads.signalUnknown,
  overridden: I18N_KEYS.squads.signalOverridden,
};

export const SIGNAL_STATUS_TONES: Record<EligibilityStatus, string> = {
  passed: 'success',
  warning: 'warning',
  failed: 'danger',
  unknown: 'medium',
  overridden: 'primary',
};

export const AVAILABILITY_LABEL_KEYS: Record<AvailabilityValue, string> = {
  available: I18N_KEYS.squads.availabilityAvailable,
  unavailable: I18N_KEYS.squads.availabilityUnavailable,
  tentative: I18N_KEYS.squads.availabilityTentative,
};

export const SELECTION_ROLE_LABEL_KEYS: Record<SelectionRole, string> = {
  player: I18N_KEYS.squads.rolePlayer,
  captain: I18N_KEYS.squads.roleCaptain,
  vice_captain: I18N_KEYS.squads.roleViceCaptain,
};

export const SQUAD_TRANSITION_LABEL_KEYS: Record<SquadTransition, string> = {
  publish: I18N_KEYS.squads.transitionPublish,
  lock: I18N_KEYS.squads.transitionLock,
  revise: I18N_KEYS.squads.transitionRevise,
  archive: I18N_KEYS.squads.transitionArchive,
};

export const SQUAD_TRANSITION_TONES: Record<SquadTransition, string> = {
  publish: 'primary',
  lock: 'secondary',
  revise: 'secondary',
  archive: 'danger',
};
