import { isAppError } from '@/shared/errors';
import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

/**
 * Backend message keys a lifecycle move can surface, mapped to copy that says
 * what actually happened. `seasonAlreadyActive` is the one that matters most:
 * exactly one active season per team is a database invariant, so activating a
 * second is a real conflict to explain, never something to retry.
 */
const TEAM_TRANSITION_ERRORS: Readonly<Record<string, I18nKey>> = {
  'errors.teams.teamInvalidTransition': I18N_KEYS.teamsAdmin.transitionInvalidError,
};

const SEASON_TRANSITION_ERRORS: Readonly<Record<string, I18nKey>> = {
  'errors.teams.seasonAlreadyActive': I18N_KEYS.seasonsAdmin.alreadyActiveError,
  'errors.teams.seasonInvalidTransition': I18N_KEYS.seasonsAdmin.invalidTransitionError,
};

function resolve(
  table: Readonly<Record<string, I18nKey>>,
  fallback: I18nKey,
  error: unknown,
): I18nKey {
  if (!isAppError(error) || error.messageKey === undefined) {
    return fallback;
  }
  return table[error.messageKey] ?? fallback;
}

/** The copy for a refused team lifecycle move. */
export function resolveTeamTransitionErrorKey(error: unknown): I18nKey {
  return resolve(TEAM_TRANSITION_ERRORS, I18N_KEYS.teamsAdmin.failedToast, error);
}

/** The copy for a refused season lifecycle move. */
export function resolveSeasonTransitionErrorKey(error: unknown): I18nKey {
  return resolve(SEASON_TRANSITION_ERRORS, I18N_KEYS.seasonsAdmin.failedToast, error);
}
