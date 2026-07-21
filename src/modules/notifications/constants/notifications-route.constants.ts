/** The path parameter the deep-link arrival screen resolves a notification by. */
export const NOTIFICATION_ID_PARAM = 'notificationId';

/** The empty quiet-hours draft: nothing edited, so the server value shows. */
export const EMPTY_QUIET_HOURS_DRAFT = {
  startsLocal: null,
  endsLocal: null,
  urgent: null,
} as const;
