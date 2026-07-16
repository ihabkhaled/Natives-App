import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import { homePath, welcomePath } from './home.paths';

describe('welcomePath', () => {
  it('derives the welcome route from the canonical route table', () => {
    expect(welcomePath()).toBe(APP_PATHS.welcome);
    expect(welcomePath()).toBe('/welcome');
  });
});

describe('homePath', () => {
  it('derives the home route from the canonical route table', () => {
    expect(homePath()).toBe(APP_PATHS.home);
    expect(homePath()).toBe('/home');
  });
});
