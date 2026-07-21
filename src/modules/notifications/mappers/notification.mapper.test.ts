import { describe, expect, it } from 'vitest';

import {
  mapNotification,
  mapNotificationPage,
  mapNotificationPreferences,
  mapQuietHours,
} from './notification.mapper';

const DTO = {
  id: 'ntf-1',
  teamId: 'team-1',
  category: 'practice' as const,
  eventType: 'practice.session.published',
  titleKey: 'notifications.eventPracticePublished',
  bodyKey: 'notifications.bodyGeneric',
  params: { sessionId: 'session-1', attempt: 2, urgent: true },
  readAt: null,
  createdAt: '2026-07-20T09:00:00.000Z',
};

describe('mapNotification', () => {
  it('narrows every parameter to a string so a path builder never sees a number', () => {
    expect(mapNotification(DTO).params).toEqual({
      sessionId: 'session-1',
      attempt: '2',
      urgent: 'true',
    });
  });

  it('preserves a null team and a null read instant rather than inventing values', () => {
    const mapped = mapNotification({ ...DTO, teamId: null, readAt: null });

    expect(mapped.teamId).toBeNull();
    expect(mapped.readAt).toBeNull();
  });

  it('keeps the read instant when the server sent one', () => {
    expect(mapNotification({ ...DTO, readAt: '2026-07-20T10:00:00.000Z' }).readAt).toBe(
      '2026-07-20T10:00:00.000Z',
    );
  });
});

describe('mapNotificationPage', () => {
  it('carries the bounded envelope alongside the items', () => {
    expect(mapNotificationPage({ items: [DTO], total: 7, limit: 20, offset: 0 })).toEqual({
      items: [mapNotification(DTO)],
      total: 7,
      limit: 20,
      offset: 0,
    });
  });
});

describe('mapNotificationPreferences', () => {
  it('copies each stored switch', () => {
    expect(
      mapNotificationPreferences({
        items: [{ category: 'practice', channel: 'email', enabled: true }],
      }),
    ).toEqual({ items: [{ category: 'practice', channel: 'email', enabled: true }] });
  });
});

describe('mapQuietHours', () => {
  it('drops the user id, which no screen needs', () => {
    expect(
      mapQuietHours({
        userId: 'user-1',
        timezone: 'Africa/Cairo',
        startsLocal: '22:00',
        endsLocal: '07:00',
        urgentCancellationOverride: true,
      }),
    ).toEqual({
      timezone: 'Africa/Cairo',
      startsLocal: '22:00',
      endsLocal: '07:00',
      urgentCancellationOverride: true,
    });
  });
});
