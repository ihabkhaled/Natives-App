import type { InvalidatingMutationView } from '@/packages/query';

import type { QuietHours, UpdatePreferenceCommand } from './notifications.types';

/** Success/failure reporting every notification command shares. */
export interface NotificationsMutationCallbacks {
  readonly onSuccess: () => void;
  readonly onError: () => void;
}

export type MarkReadMutationView = InvalidatingMutationView<string>;

export type PreferenceMutationView = InvalidatingMutationView<UpdatePreferenceCommand>;

export type QuietHoursMutationView = InvalidatingMutationView<QuietHours>;
