import { describe, expect, it } from 'vitest';

import { buildNotificationItem } from '../../../../tests/factories/notifications.factory';

import { PERMISSIONS } from '@/shared/security';

import { isTargetAuthorized, resolveNotificationTarget } from './notification-target.helper';

describe('resolveNotificationTarget', () => {
  it('routes a published practice at the session, gated on the read grant', () => {
    expect(resolveNotificationTarget(buildNotificationItem())).toEqual({
      path: '/practices/session-1',
      permissions: [PERMISSIONS.practicesRead],
    });
  });

  it('routes a cancelled practice at the same session screen', () => {
    expect(
      resolveNotificationTarget(buildNotificationItem({ eventType: 'practice.session.cancelled' }))
        ?.path,
    ).toBe('/practices/session-1');
  });

  it('routes a finalized attendance sheet at the attendance screen', () => {
    expect(
      resolveNotificationTarget(buildNotificationItem({ eventType: 'attendance.sheet.finalized' })),
    ).toEqual({
      path: '/practices/session-1/attendance',
      permissions: [PERMISSIONS.attendanceMark],
    });
  });

  it('routes membership events at the member profile', () => {
    const params = { membershipId: 'm-1' };
    expect(
      resolveNotificationTarget(buildNotificationItem({ eventType: 'member.invited', params }))
        ?.path,
    ).toBe('/members/m-1');
    expect(
      resolveNotificationTarget(buildNotificationItem({ eventType: 'member.activated', params }))
        ?.path,
    ).toBe('/members/m-1');
  });

  it('routes a published assessment at its entry screen', () => {
    expect(
      resolveNotificationTarget(
        buildNotificationItem({
          eventType: 'assessment.published',
          params: { assessmentId: 'a-1' },
        }),
      ),
    ).toEqual({
      path: '/assessments/a-1',
      permissions: [PERMISSIONS.assessmentReadSelfPublished],
    });
  });

  it('routes a published roster at its workspace', () => {
    expect(
      resolveNotificationTarget(
        buildNotificationItem({ eventType: 'roster.published', params: { rosterId: 'r-1' } }),
      ),
    ).toEqual({ path: '/rosters/r-1', permissions: [PERMISSIONS.rosterRead] });
  });

  it('resolves nothing for an event type the client does not route', () => {
    expect(
      resolveNotificationTarget(buildNotificationItem({ eventType: 'security.alert', params: {} })),
    ).toBeNull();
  });

  it('resolves nothing when the identifier the route needs is absent', () => {
    expect(resolveNotificationTarget(buildNotificationItem({ params: {} }))).toBeNull();
  });

  it('resolves nothing when the identifier is present but empty', () => {
    expect(
      resolveNotificationTarget(buildNotificationItem({ params: { sessionId: '' } })),
    ).toBeNull();
  });
});

describe('isTargetAuthorized', () => {
  const target = { path: '/practices/session-1', permissions: [PERMISSIONS.practicesRead] };

  it('admits a principal holding every required grant', () => {
    expect(isTargetAuthorized(target, [PERMISSIONS.practicesRead, PERMISSIONS.memberList])).toBe(
      true,
    );
  });

  it('refuses a principal whose grant was revoked', () => {
    expect(isTargetAuthorized(target, [PERMISSIONS.memberList])).toBe(false);
  });

  it('admits a target that demands nothing', () => {
    expect(isTargetAuthorized({ path: '/home', permissions: [] }, [])).toBe(true);
  });
});
