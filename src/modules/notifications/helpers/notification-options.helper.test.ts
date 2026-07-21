import { describe, expect, it } from 'vitest';

import { buildCategoryOptions, buildStatusOptions } from './notification-options.helper';

const t = (key: string): string => key;

describe('buildStatusOptions', () => {
  it('offers all, unread, and read in that order', () => {
    expect(buildStatusOptions(t)).toEqual([
      { value: 'all', label: 'notifications.statusAll' },
      { value: 'unread', label: 'notifications.statusUnread' },
      { value: 'read', label: 'notifications.statusRead' },
    ]);
  });
});

describe('buildCategoryOptions', () => {
  const options = buildCategoryOptions(t);

  it('puts an explicit all entry ahead of the catalog', () => {
    expect(options[0]).toEqual({ value: 'all', label: 'notifications.categoryAll' });
  });

  it('offers one entry per catalog category', () => {
    expect(options.slice(1).map((option) => option.value)).toEqual([
      'member_lifecycle',
      'practice',
      'attendance',
      'system',
    ]);
  });
});
