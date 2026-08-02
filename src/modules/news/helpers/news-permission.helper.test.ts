import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from '@/shared/security';

import { canManageNews } from './news-permission.helper';

describe('canManageNews', () => {
  it('grants a session holding the exact backend string', () => {
    expect(canManageNews([PERMISSIONS.newsManage])).toBe(true);
    expect(PERMISSIONS.newsManage).toBe('news.manage');
  });

  it('refuses a plain member, whatever else they hold', () => {
    expect(
      canManageNews([
        PERMISSIONS.practicesRead,
        PERMISSIONS.matchRead,
        PERMISSIONS.memberProfileUpdateSelf,
      ]),
    ).toBe(false);
  });

  it('refuses a session with no grants at all', () => {
    expect(canManageNews([])).toBe(false);
  });

  it('refuses a near-miss spelling the backend never emits', () => {
    expect(canManageNews(['news.write', 'news', 'newsManage'])).toBe(false);
  });
});
