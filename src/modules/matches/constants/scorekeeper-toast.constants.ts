import { I18N_KEYS } from '@/shared/i18n';
import type { ToastTone } from '@/shared/ui';

import type { ScorekeeperActionStatus } from '../types/matches.types';

/**
 * What the field is told after each command. `replayed` deliberately says the
 * score did NOT change: a scorekeeper who taps twice must see that the second
 * tap was recognized as the same operation, not that it was ignored.
 */
export const SCOREKEEPER_TOAST_KEYS: Record<ScorekeeperActionStatus, string> = {
  applied: I18N_KEYS.scorekeeperQueue.appliedToast,
  replayed: I18N_KEYS.scorekeeperQueue.replayedToast,
  conflict: I18N_KEYS.scorekeeperQueue.conflictToast,
  queued: I18N_KEYS.scorekeeperQueue.queuedToast,
  'blocked-at-limit': I18N_KEYS.scorekeeperQueue.limitBlocked,
  failed: I18N_KEYS.scorekeeperQueue.limitBlocked,
};

export const SCOREKEEPER_TOAST_TONES: Record<ScorekeeperActionStatus, ToastTone> = {
  applied: 'success',
  replayed: 'success',
  conflict: 'danger',
  queued: 'warning',
  'blocked-at-limit': 'danger',
  failed: 'danger',
};
