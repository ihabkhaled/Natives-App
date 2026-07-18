import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import { adminPath } from './admin.paths';

describe('adminPath', () => {
  it('resolves to the canonical admin route', () => {
    expect(adminPath()).toBe(APP_PATHS.admin);
  });
});
