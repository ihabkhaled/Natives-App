import type { QuietHours } from '../types/notifications.types';
import type { QuietHoursDraft } from '../types/notifications-view.types';
import { isValidLocalTime } from './notification-preference.helper';

/** Draft value, else the server value, else the empty string. */
function pick(drafted: string | null, stored: string | undefined): string {
  return drafted ?? stored ?? '';
}

export interface ResolvedQuietHours {
  readonly startsLocal: string;
  readonly endsLocal: string;
  readonly timezone: string;
  readonly urgent: boolean;
  readonly isValid: boolean;
}

/**
 * Merge the local draft over the server value. An untouched field falls back
 * to what the server holds, and validity is decided here so the form can
 * block a save instead of sending a wall-clock time the API would reject.
 */
export function resolveQuietHoursDraft(
  draft: QuietHoursDraft,
  server: QuietHours | undefined,
): ResolvedQuietHours {
  const startsLocal = pick(draft.startsLocal, server?.startsLocal);
  const endsLocal = pick(draft.endsLocal, server?.endsLocal);
  return {
    startsLocal,
    endsLocal,
    timezone: pick(null, server?.timezone),
    urgent: draft.urgent ?? server?.urgentCancellationOverride ?? false,
    isValid: isValidLocalTime(startsLocal) && isValidLocalTime(endsLocal),
  };
}
