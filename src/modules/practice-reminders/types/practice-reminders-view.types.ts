/** One finished-action message, already translated. */
export interface ReminderMessageView {
  readonly id: string;
  readonly text: string;
}

/** Everything the reminders screen renders, ready to display. */
export interface PracticeRemindersScreenView {
  readonly title: string;
  readonly subtitle: string;
  readonly isLoading: boolean;
  readonly loadingLabel: string;
  readonly isForbidden: boolean;
  readonly hasError: boolean;
  readonly errorTitle: string;
  readonly errorMessage: string;
  /** Human counts, already formatted with their numbers. */
  readonly eligibleLabel: string;
  readonly noResponseLabel: string;
  /** The one sentence explaining whether sending is worth doing. */
  readonly windowLabel: string;
  readonly kindsHeading: string;
  readonly kindLabels: readonly string[];
  readonly kindsEmptyLabel: string;
  readonly dispatchLabel: string;
  readonly canDispatch: boolean;
  readonly isDispatching: boolean;
  readonly onDispatch: () => void;
  readonly testLabel: string;
  readonly isTesting: boolean;
  readonly onTest: () => void;
  /** The outcome of the last action, or empty before one has run. */
  readonly messages: readonly ReminderMessageView[];
}
