import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from '@/shared/security';

import type { NotificationItem } from '../types/notifications.types';
import { isTargetAuthorized, resolveNotificationTarget } from './notification-target.helper';

function item(overrides: Partial<NotificationItem> = {}): NotificationItem {
  return {
    id: 'ntf-1',
    teamId: 'team-1',
    category: 'practice',
    eventType: 'practice.session.published',
    titleKey: 'notifications.eventPracticePublished',
    bodyKey: 'notifications.bodyGeneric',
    params: { sessionId: 'session-1' },
    readAt: null,
    createdAt: '2026-07-20T09:00:00.000Z',
    ...overrides,
  };
}

describe('resolveNotificationTarget', () => {
  it('routes a published practice at the session, gated on the read grant', () => {
    expect(resolveNotificationTarget(item())).toEqual({
      path: '/practices/session-1',
      permissions: [PERMISSIONS.practicesRead],
    });
  });

  it('routes a cancelled practice at the same session screen', () => {
    expect(
      resolveNotificationTarget(item({ eventType: 'practice.session.cancelled' }))?.path,
    ).toBe('/practices/session-1');
  });

  it('routes a finalized attendance sheet at the attendance screen', () => {
    expect(resolveNotificationTarget(item({ eventType: 'attendance.sheet.finalized' }))).toEqual({
      path: '/practices/session-1/attendance',
      permissions: [PERMISSIONS.attendanceMark],
    });
  });

  it('routes membership events at the member profile', () => {
    const params = { membershipId: 'm-1' };
    expect(resolveNotificationTarget(item({ eventType: 'member.invited', params }))?.path).toBe(
      '/members/m-1',
    );
    expect(resolveNotificationTarget(item({ eventType: 'member.activated', params }))?.path).toBe(
      '/members/m-1',
    );
  });

  it('routes a published assessment at its entry screen', () => {
    expect(
      resolveNotificationTarget(
        item({ eventType: 'assessment.published', params: { assessmentId: 'a-1' } }),
      ),
    ).toEqual({
      path: '/assessments/a-1',
      permissions: [PERMISSIONS.assessmentReadSelfPublished],
    });
  });

  it('routes a published roster at its workspace', () => {
    expect(
      resolveNotificationTarget(
        item({ eventType: 'roster.published', params: { rosterId: 'r-1' } }),
      ),
    ).toEqual({ path: '/rosters/r-1', permissions: [PERMISSIONS.rosterRead] });
  });

  it('resolves nothing for an event type the client does not route', () => {
    expect(resolveNotificationTarget(item({ eventType: 'security.alert', params: {} }))).toBeNull();
  });

  it('resolves nothing when the identifier the route needs is absent', () => {
    expect(resolveNotificationTarget(item({ params: {} }))).toBeNull();
  });

  it('resolves nothing when the identifier is present but empty', () => {
    expect(resolveNotificationTarget(item({ params: { sessionId: '' } }))).toBeNull();
  });
});

describe('isTargetAuthorized', () => {
  const target = { path: '/practices/session-1', permissions: [PERMISSIONS.practicesRead] };

  it('admits a principal holding every required grant', () => {
    expect(isTargetAuthorized(target, [PERMISSIONS.practicesRead, PERMISSIONS.membersRead])).toBe(
      true,
    );
  });

  it('refuses a principal whose grant was revoked', () => {
    expect(isTargetAuthorized(target, [PERMISSIONS.membersRead])).toBe(false);
  });

  it('admits a target that demands nothing', () => {
    expect(isTargetAuthorized({ path: '/home', permissions: [] }, [])).toBe(true);
  });
});
