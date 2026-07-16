import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import { loginPath } from './auth.paths';

describe('loginPath', () => {
  it('derives the login route from the canonical route table', () => {
    expect(loginPath()).toBe(APP_PATHS.login);
    expect(loginPath()).toBe('/login');
  });
});
