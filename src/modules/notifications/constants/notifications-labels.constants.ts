import { I18N_KEYS } from '@/shared/i18n';

import type {
  DeliveryState,
  NotificationCategory,
  NotificationChannel,
  NotificationGroup,
} from './notifications.constants';

export const CATEGORY_LABEL_KEYS: Record<NotificationCategory, string> = {
  member_lifecycle: I18N_KEYS.notifications.categoryMemberLifecycle,
  practice: I18N_KEYS.notifications.categoryPractice,
  attendance: I18N_KEYS.notifications.categoryAttendance,
  system: I18N_KEYS.notifications.categorySystem,
};

/** Ionic colour tokens; gold stays reserved for achievements and ranks. */
export const CATEGORY_TONES: Record<NotificationCategory, string> = {
  member_lifecycle: 'secondary',
  practice: 'primary',
  attendance: 'success',
  system: 'warning',
};

export const CHANNEL_LABEL_KEYS: Record<NotificationChannel, string> = {
  in_app: I18N_KEYS.notifications.channelInApp,
  email: I18N_KEYS.notifications.channelEmail,
  push: I18N_KEYS.notifications.channelPush,
};

export const GROUP_LABEL_KEYS: Record<NotificationGroup, string> = {
  today: I18N_KEYS.notifications.groupToday,
  yesterday: I18N_KEYS.notifications.groupYesterday,
  earlier: I18N_KEYS.notifications.groupEarlier,
};

export const DELIVERY_LABEL_KEYS: Record<DeliveryState, string> = {
  delivered: I18N_KEYS.notifications.deliveryDelivered,
  read: I18N_KEYS.notifications.deliveryRead,
};

export const DELIVERY_TONES: Record<DeliveryState, string> = {
  delivered: 'primary',
  read: 'medium',
};

/**
 * Event-type copy. An unmapped event falls back to the generic title so a new
 * backend event can never render a raw wire string at the user.
 */
export const EVENT_TITLE_KEYS: Readonly<Record<string, string>> = {
  'practice.session.published': I18N_KEYS.notifications.eventPracticePublished,
  'practice.session.cancelled': I18N_KEYS.notifications.eventPracticeCancelled,
  'attendance.sheet.finalized': I18N_KEYS.notifications.eventAttendanceFinalized,
  'member.invited': I18N_KEYS.notifications.eventMemberInvited,
  'member.activated': I18N_KEYS.notifications.eventMemberActivated,
  'assessment.published': I18N_KEYS.notifications.eventAssessmentPublished,
  'roster.published': I18N_KEYS.notifications.eventRosterPublished,
  'report.ready': I18N_KEYS.notifications.eventReportReady,
  'security.alert': I18N_KEYS.notifications.eventSecurityAlert,
  'system.notice': I18N_KEYS.notifications.eventSystemNotice,
};

/** The shared async-state copy the notification screens draw from. */
export const NOTIFICATIONS_COPY_NAMESPACE = {
  loadingLabel: I18N_KEYS.notifications.loadingLabel,
  errorTitle: I18N_KEYS.notifications.errorTitle,
  errorMessage: I18N_KEYS.notifications.errorMessage,
  retry: I18N_KEYS.notifications.retry,
  offlineTitle: I18N_KEYS.notifications.offlineTitle,
  offlineMessage: I18N_KEYS.notifications.offlineMessage,
  forbiddenTitle: I18N_KEYS.notifications.forbiddenTitle,
  forbiddenMessage: I18N_KEYS.notifications.forbiddenMessage,
} as const;
