import { I18N_KEYS } from '@/shared/i18n';

import type { DeadLetter } from '../types/admin.types';
import type { DeadLetterRowView } from '../types/admin-view.types';

type Translate = (key: string, params?: Record<string, string | number>) => string;
type FormatInstant = (iso: string) => string;

export interface ReplayCapability {
  readonly canReplay: boolean;
  readonly onReplay: (eventId: string) => void;
}

/**
 * One failed event. The row carries an id, a type, a failure code, and a
 * count — the domain type has no payload field at all, so a body cannot be
 * rendered here even by accident.
 */
export function buildDeadLetterRows(
  t: Translate,
  formatInstant: FormatInstant,
  items: readonly DeadLetter[],
  replay: ReplayCapability,
): readonly DeadLetterRowView[] {
  return items.map((item) => ({
    eventId: item.eventId,
    eventType: item.eventType,
    attemptsLabel: t(I18N_KEYS.adminOperations.deadLetterAttempts, { count: item.attempts }),
    failedAtLabel: formatInstant(item.failedAt),
    failureCode: item.failureCode,
    replayLabel: t(I18N_KEYS.adminOperations.replayAction),
    canReplay: replay.canReplay,
    onReplay: () => {
      replay.onReplay(item.eventId);
    },
  }));
}
