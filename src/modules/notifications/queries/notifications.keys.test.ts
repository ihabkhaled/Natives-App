import { describe, expect, it } from 'vitest';

import { notificationsQueryKeys } from './notifications.keys';

describe('notificationsQueryKeys', () => {
  it('roots every key under one namespace', () => {
    expect(notificationsQueryKeys.all).toEqual(['notifications']);
  });

  it('keys the inbox on its bounded window size', () => {
    expect(notificationsQueryKeys.inbox(20)).toEqual(['notifications', 'inbox', 20]);
    expect(notificationsQueryKeys.inbox(40)).not.toEqual(notificationsQueryKeys.inbox(20));
  });

  it('keeps preferences and quiet hours on separate branches', () => {
    expect(notificationsQueryKeys.preferences()).toEqual(['notifications', 'preferences']);
    expect(notificationsQueryKeys.quietHours()).toEqual(['notifications', 'quiet-hours']);
  });
});
