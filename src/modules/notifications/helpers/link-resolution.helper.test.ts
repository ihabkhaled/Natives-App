import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from '@/shared/security';

import type { NotificationItem } from '../types/notifications.types';
import { linkStatusFor, resolveLink } from './link-resolution.helper';

const ROUTABLE: NotificationItem = {
  id: 'ntf-1',
  teamId: 'team-1',
  category: 'practice',
  eventType: 'practice.session.published',
  titleKey: 'notifications.eventPracticePublished',
  bodyKey: 'notifications.bodyGeneric',
  params: { sessionId: 'session-1' },
  readAt: null,
  createdAt: '2026-07-20T09:00:00.000Z',
};

describe('resolveLink', () => {
  it('reports resolving while the inbox or the grants are still loading', () => {
    expect(
      resolveLink({ isLoading: true, hasError: false, item: ROUTABLE, grantedPermissions: [] }),
    ).toEqual({ outcome: 'resolving', path: null });
  });

  it('authorizes and hands back the path when every grant still holds', () => {
    expect(
      resolveLink({
        isLoading: false,
        hasError: false,
        item: ROUTABLE,
        grantedPermissions: [PERMISSIONS.practicesRead],
      }),
    ).toEqual({ outcome: 'authorized', path: '/practices/session-1' });
  });

  it('forbids with no path once the permission was revoked', () => {
    expect(
      resolveLink({
        isLoading: false,
        hasError: false,
        item: ROUTABLE,
        grantedPermissions: [PERMISSIONS.membersRead],
      }),
    ).toEqual({ outcome: 'forbidden', path: null });
  });

  it('reports a stale target when the notification is no longer in the inbox', () => {
    expect(
      resolveLink({
        isLoading: false,
        hasError: false,
        item: undefined,
        grantedPermissions: [PERMISSIONS.practicesRead],
      }),
    ).toEqual({ outcome: 'stale', path: null });
  });

  it('reports a stale target when the inbox read failed', () => {
    expect(
      resolveLink({
        isLoading: false,
        hasError: true,
        item: ROUTABLE,
        grantedPermissions: [PERMISSIONS.practicesRead],
      }).outcome,
    ).toBe('stale');
  });

  it('reports a stale target when the event type routes nowhere', () => {
    expect(
      resolveLink({
        isLoading: false,
        hasError: false,
        item: { ...ROUTABLE, eventType: 'security.alert', params: {} },
        grantedPermissions: [PERMISSIONS.practicesRead],
      }),
    ).toEqual({ outcome: 'stale', path: null });
  });
});

describe('linkStatusFor', () => {
  it('presents the permission state for a forbidden arrival', () => {
    expect(linkStatusFor('forbidden', false)).toBe('forbidden');
  });

  it('presents the empty state for a stale target while online', () => {
    expect(linkStatusFor('stale', false)).toBe('empty');
  });

  it('presents the offline state for a stale target while offline', () => {
    expect(linkStatusFor('stale', true)).toBe('offline');
  });

  it('keeps the loading state while resolving or redirecting', () => {
    expect(linkStatusFor('resolving', false)).toBe('loading');
    expect(linkStatusFor('authorized', false)).toBe('loading');
  });
});
