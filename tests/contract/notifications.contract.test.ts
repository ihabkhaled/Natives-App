import { assert, describe, expect, it } from 'vitest';

import {
  notificationListResponseSchema,
  notificationPreferencesResponseSchema,
  notificationResponseSchema,
  quietHoursResponseSchema,
} from '@/modules/notifications';
import { safeParseWithSchema } from '@/packages/schema';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import { MOCK_NOTIFICATIONS } from '@/tests/msw/notifications.fixture';

import { authGet, authPost, authPut, loginAs } from '../setup/contract-api.helper';

/**
 * The notification surface is deployed (platform prompt 105). These tests pin
 * the wire contract the client parses, including the two behaviours the UI
 * depends on: idempotent read state, and a mandatory category the server
 * refuses to mute.
 */
describe('notification inbox contract', () => {
  it('serves a bounded page of the caller inbox', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const response = await authGet('/notifications?limit=20&offset=0', token);
    expect(response.status).toBe(200);

    const parsed = safeParseWithSchema(notificationListResponseSchema, await response.json());
    assert(parsed.success, 'inbox violated ListNotificationsResponseDto');
    expect(parsed.data.limit).toBe(20);
    expect(parsed.data.items.length).toBeGreaterThan(0);
  });

  it('marks a notification read idempotently', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const path = `/notifications/${MOCK_NOTIFICATIONS.unreadPracticeId}/read`;

    const first = await authPost(path, token, {});
    expect(first.status).toBe(200);
    const parsedFirst = safeParseWithSchema(notificationResponseSchema, await first.json());
    assert(parsedFirst.success, 'read violated NotificationViewDto');
    expect(parsedFirst.data.readAt).not.toBeNull();

    const second = await authPost(path, token, {});
    const parsedSecond = safeParseWithSchema(notificationResponseSchema, await second.json());
    assert(parsedSecond.success, 'repeat read violated NotificationViewDto');
    expect(parsedSecond.data.readAt).toBe(parsedFirst.data.readAt);
  });
});

describe('notification preference contract', () => {
  it('returns the caller category and channel matrix', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const response = await authGet('/notifications/preferences', token);

    const parsed = safeParseWithSchema(
      notificationPreferencesResponseSchema,
      await response.json(),
    );
    assert(parsed.success, 'preferences violated PreferencesResponseDto');
    expect(parsed.data.items.length).toBeGreaterThan(0);
  });

  it('refuses to mute a mandatory security category', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const response = await authPut('/notifications/preferences', token, {
      category: 'system',
      channel: 'email',
      enabled: false,
    });

    const parsed = safeParseWithSchema(
      notificationPreferencesResponseSchema,
      await response.json(),
    );
    assert(parsed.success, 'preference update violated PreferencesResponseDto');
    const stored = parsed.data.items.find(
      (item) => item.category === 'system' && item.channel === 'email',
    );
    expect(stored?.enabled).toBe(true);
  });

  it('round-trips the quiet-hours window with its urgent override', async () => {
    const token = await loginAs(MOCK_PERSONA_EMAILS.admin);
    const response = await authPut('/notifications/quiet-hours', token, {
      timezone: 'Africa/Cairo',
      startsLocal: '21:30',
      endsLocal: '06:30',
      urgentCancellationOverride: true,
    });

    const parsed = safeParseWithSchema(quietHoursResponseSchema, await response.json());
    assert(parsed.success, 'quiet hours violated QuietHoursResponseDto');
    expect(parsed.data.startsLocal).toBe('21:30');
    expect(parsed.data.urgentCancellationOverride).toBe(true);
  });
});
