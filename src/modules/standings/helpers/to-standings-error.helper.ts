import { isHttpError } from '@/packages/http';
import { isAppError, toAppError } from '@/shared/errors';
import { I18N_KEYS, type I18nKey } from '@/shared/i18n';
import { mapHttpErrorToAppError } from '@/shared/mappers';

/**
 * Run a standings gateway request, normalizing any failure into an AppError so
 * every screen surfaces sanitized, translatable copy rather than a raw backend
 * message.
 */
export async function runStandingsRequest<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}

/** The backend key an optimistic-concurrency refusal carries. */
const VERSION_CONFLICT_MESSAGE_KEY = 'errors.standings.versionConflict';

/**
 * Whether a refusal is the concurrent-edit conflict: the caller should
 * refetch, explain "changed by someone else", and re-ask — never retry
 * blindly with the stale record version.
 */
export function isStandingsVersionConflict(error: unknown): boolean {
  return isAppError(error) && error.messageKey === VERSION_CONFLICT_MESSAGE_KEY;
}

/**
 * Backend message keys a standings write can surface, mapped to copy that
 * states what actually happened rather than a generic failure toast.
 */
const STANDINGS_WRITE_ERRORS: Readonly<Record<string, I18nKey>> = {
  [VERSION_CONFLICT_MESSAGE_KEY]: I18N_KEYS.standings.transitionConflict,
  'errors.standings.achievementInvalidTransition': I18N_KEYS.standings.transitionFailed,
  'errors.standings.provenanceRequired': I18N_KEYS.standings.manualNoteTooShort,
  'errors.standings.validation': I18N_KEYS.standings.createValidation,
};

/** The copy for a refused standings write. */
export function resolveStandingsWriteErrorKey(error: unknown, fallback: I18nKey): I18nKey {
  if (!isAppError(error) || error.messageKey === undefined) {
    return fallback;
  }
  return STANDINGS_WRITE_ERRORS[error.messageKey] ?? fallback;
}
