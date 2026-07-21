import type {
  notificationListResponseSchema,
  notificationPreferencesResponseSchema,
  notificationResponseSchema,
  quietHoursResponseSchema,
} from '@/modules/notifications';
import type { SchemaOutput } from '@/packages/schema';

type NotificationDto = SchemaOutput<typeof notificationResponseSchema>;
type NotificationListDto = SchemaOutput<typeof notificationListResponseSchema>;
type PreferencesDto = SchemaOutput<typeof notificationPreferencesResponseSchema>;
type QuietHoursDto = SchemaOutput<typeof quietHoursResponseSchema>;

/**
 * Deterministic notification fixtures. Shapes mirror the deployed platform
 * contract exactly, so the same Zod schemas parse mock and remote responses.
 */
export const MOCK_NOTIFICATIONS = {
  unreadPracticeId: 'ntf-0000-0000-0001',
  readMemberId: 'ntf-0000-0000-0002',
  systemId: 'ntf-0000-0000-0003',
  forbiddenAttendanceId: 'ntf-0000-0000-0004',
  staleId: 'ntf-0000-0000-0005',
  sessionId: '00000000-0000-4000-8000-0000000000a1',
  membershipId: '00000000-0000-4000-8000-0000000000b1',
  now: '2026-07-20T09:00:00.000Z',
  yesterday: '2026-07-19T09:00:00.000Z',
  earlier: '2026-07-10T09:00:00.000Z',
} as const;

interface NotificationRecord {
  id: string;
  teamId: string | null;
  category: 'member_lifecycle' | 'practice' | 'attendance' | 'system';
  eventType: string;
  titleKey: string;
  bodyKey: string;
  params: Record<string, string>;
  readAt: string | null;
  createdAt: string;
}

function seedTeamNotifications(): NotificationRecord[] {
  return [
    {
      id: MOCK_NOTIFICATIONS.unreadPracticeId,
      teamId: 'team-ultimate-natives',
      category: 'practice',
      eventType: 'practice.session.published',
      titleKey: 'notifications.eventPracticePublished',
      bodyKey: 'notifications.bodyGeneric',
      params: { sessionId: MOCK_NOTIFICATIONS.sessionId },
      readAt: null,
      createdAt: MOCK_NOTIFICATIONS.now,
    },
    {
      id: MOCK_NOTIFICATIONS.readMemberId,
      teamId: 'team-ultimate-natives',
      category: 'member_lifecycle',
      eventType: 'member.activated',
      titleKey: 'notifications.eventMemberActivated',
      bodyKey: 'notifications.bodyGeneric',
      params: { membershipId: MOCK_NOTIFICATIONS.membershipId },
      readAt: MOCK_NOTIFICATIONS.now,
      createdAt: MOCK_NOTIFICATIONS.yesterday,
    },
  ];
}

function seedSystemNotifications(): NotificationRecord[] {
  return [
    {
      id: MOCK_NOTIFICATIONS.systemId,
      teamId: null,
      category: 'system',
      eventType: 'security.alert',
      titleKey: 'notifications.eventSecurityAlert',
      bodyKey: 'notifications.bodyGeneric',
      params: {},
      readAt: null,
      createdAt: MOCK_NOTIFICATIONS.earlier,
    },
    {
      id: MOCK_NOTIFICATIONS.forbiddenAttendanceId,
      teamId: 'team-ultimate-natives',
      category: 'attendance',
      eventType: 'attendance.sheet.finalized',
      titleKey: 'notifications.eventAttendanceFinalized',
      bodyKey: 'notifications.bodyGeneric',
      params: { sessionId: MOCK_NOTIFICATIONS.sessionId },
      readAt: null,
      createdAt: MOCK_NOTIFICATIONS.yesterday,
    },
    {
      id: MOCK_NOTIFICATIONS.staleId,
      teamId: 'team-ultimate-natives',
      category: 'system',
      eventType: 'report.ready',
      titleKey: 'notifications.eventReportReady',
      bodyKey: 'notifications.bodyGeneric',
      params: {},
      readAt: null,
      createdAt: MOCK_NOTIFICATIONS.earlier,
    },
  ];
}

function seedNotifications(): NotificationRecord[] {
  return [...seedTeamNotifications(), ...seedSystemNotifications()];
}

let notifications = seedNotifications();

interface PreferenceRecord {
  category: 'member_lifecycle' | 'practice' | 'attendance' | 'system';
  channel: 'in_app' | 'email' | 'push';
  enabled: boolean;
}

function seedPreferences(): PreferenceRecord[] {
  return [
    { category: 'practice', channel: 'email', enabled: true },
    { category: 'practice', channel: 'push', enabled: false },
    { category: 'attendance', channel: 'email', enabled: false },
    { category: 'member_lifecycle', channel: 'email', enabled: true },
    { category: 'system', channel: 'email', enabled: true },
    { category: 'system', channel: 'push', enabled: true },
  ];
}

let preferences = seedPreferences();

let quietHours = {
  userId: 'user-admin',
  timezone: 'Africa/Cairo',
  startsLocal: '22:00',
  endsLocal: '07:00',
  urgentCancellationOverride: true,
};

export function resetMockNotificationsState(): void {
  notifications = seedNotifications();
  preferences = seedPreferences();
  quietHours = {
    userId: 'user-admin',
    timezone: 'Africa/Cairo',
    startsLocal: '22:00',
    endsLocal: '07:00',
    urgentCancellationOverride: true,
  };
}

export function notificationsResponse(limit: number, offset: number): NotificationListDto {
  return {
    items: notifications.slice(offset, offset + limit).map((item) => ({ ...item })),
    total: notifications.length,
    limit,
    offset,
  };
}

/** Idempotent: a second call returns the same already-set read instant. */
export function markNotificationReadRecord(notificationId: string): NotificationDto | null {
  const record = notifications.find((item) => item.id === notificationId);
  if (record === undefined) {
    return null;
  }
  record.readAt = record.readAt ?? MOCK_NOTIFICATIONS.now;
  return { ...record };
}

export function preferencesResponse(): PreferencesDto {
  return { items: preferences.map((item) => ({ ...item })) };
}

/** Mandatory categories are ignored server-side, exactly as in production. */
export function updatePreferenceRecord(
  category: string,
  channel: string,
  enabled: boolean,
): PreferencesDto {
  if (category !== 'system' && channel !== 'in_app') {
    const existing = preferences.find(
      (item) => item.category === category && item.channel === channel,
    );
    if (existing === undefined) {
      preferences.push({ category, channel, enabled } as PreferenceRecord);
    } else {
      existing.enabled = enabled;
    }
  }
  return preferencesResponse();
}

export function quietHoursResponse(): QuietHoursDto {
  return { ...quietHours };
}

export function updateQuietHoursRecord(next: {
  timezone: string;
  startsLocal: string;
  endsLocal: string;
  urgentCancellationOverride: boolean;
}): QuietHoursDto {
  quietHours = { ...quietHours, ...next };
  return { ...quietHours };
}
