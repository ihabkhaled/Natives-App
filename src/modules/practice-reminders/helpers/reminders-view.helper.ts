import { I18N_KEYS } from '@/shared/i18n';

import type {
  PracticeRemindersScreenView,
  ReminderMessageView,
} from '../types/practice-reminders-view.types';
import type { ReminderStatus } from '../types/practice-reminders.types';
import { canDispatchReminders, resolveReminderWindowKey } from './reminder-window.helper';

const KEYS = I18N_KEYS.practiceReminders;

/** Translate with optional interpolation, as the i18n package exposes it. */
type Translate = (key: string, params?: Readonly<Record<string, number>>) => string;

/** Everything the screen needs that is not copy. */
export interface RemindersViewInput {
  readonly status: ReminderStatus | undefined;
  readonly isLoading: boolean;
  readonly isForbidden: boolean;
  readonly hasError: boolean;
  readonly isDispatching: boolean;
  /** The status read is in flight; the counts on screen are already stale. */
  readonly isRefreshing: boolean;
  readonly isTesting: boolean;
  readonly onDispatch: () => void;
  readonly onTest: () => void;
  readonly messages: readonly ReminderMessageView[];
}

/** Static copy — the strings that never depend on server state. */
function buildChrome(
  t: Translate,
): Pick<
  PracticeRemindersScreenView,
  | 'title'
  | 'subtitle'
  | 'loadingLabel'
  | 'errorTitle'
  | 'errorMessage'
  | 'kindsHeading'
  | 'kindsEmptyLabel'
> {
  return {
    title: t(KEYS.title),
    subtitle: t(KEYS.subtitle),
    loadingLabel: t(KEYS.loadingLabel),
    errorTitle: t(KEYS.errorTitle),
    errorMessage: t(KEYS.errorMessage),
    kindsHeading: t(KEYS.kindsHeading),
    kindsEmptyLabel: t(KEYS.kindsEmpty),
  };
}

/**
 * What the status says. Counts fall back to zero rather than blanking: a
 * screen mid-load should read "0 eligible" rather than an empty line that
 * looks like a missing string.
 */
function buildStatusCopy(
  t: Translate,
  status: ReminderStatus | undefined,
): Pick<
  PracticeRemindersScreenView,
  'eligibleLabel' | 'noResponseLabel' | 'windowLabel' | 'kindLabels'
> {
  return {
    eligibleLabel: t(KEYS.eligibleLabel, { count: status?.totalEligible ?? 0 }),
    noResponseLabel: t(KEYS.noResponseLabel, { count: status?.noResponse ?? 0 }),
    windowLabel: status === undefined ? '' : t(resolveReminderWindowKey(status)),
    kindLabels: status?.kinds ?? [],
  };
}

/** The two buttons: their labels, whether they can run, and what they run. */
function buildActions(
  t: Translate,
  input: RemindersViewInput,
): Pick<
  PracticeRemindersScreenView,
  | 'dispatchLabel'
  | 'canDispatch'
  | 'isDispatching'
  | 'onDispatch'
  | 'testLabel'
  | 'isTesting'
  | 'onTest'
> {
  const { status } = input;
  return {
    dispatchLabel: input.isDispatching ? t(KEYS.dispatchRunning) : t(KEYS.dispatchAction),
    // Also gated on the refresh: between a dispatch settling and its status
    // re-read landing, the screen still holds the PRE-send counts. Enabling the
    // button there invites a second send against numbers already spent.
    canDispatch:
      status !== undefined &&
      canDispatchReminders(status) &&
      !input.isDispatching &&
      !input.isRefreshing,
    isDispatching: input.isDispatching,
    onDispatch: input.onDispatch,
    testLabel: input.isTesting ? t(KEYS.testRunning) : t(KEYS.testAction),
    isTesting: input.isTesting,
    onTest: input.onTest,
  };
}

/**
 * Assemble the whole view from three focused builders.
 *
 * Extracted from the screen hook so the hook only wires queries, mutations and
 * state, and every piece of copy resolution is testable without rendering.
 */
export function buildRemindersView(
  t: Translate,
  input: RemindersViewInput,
): PracticeRemindersScreenView {
  return {
    ...buildChrome(t),
    ...buildStatusCopy(t, input.status),
    ...buildActions(t, input),
    isLoading: input.isLoading,
    isForbidden: input.isForbidden,
    hasError: input.hasError,
    messages: input.messages,
  };
}
