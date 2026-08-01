import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import { aboutPath, homePath, welcomePath } from './home.paths';

describe('welcomePath', () => {
  it('derives the welcome route from the canonical route table', () => {
    expect(welcomePath()).toBe(APP_PATHS.welcome);
    expect(welcomePath()).toBe('/welcome');
  });
});

describe('aboutPath', () => {
  it('derives the about route from the canonical route table', () => {
    expect(aboutPath()).toBe(APP_PATHS.about);
    expect(aboutPath()).toBe('/about');
  });
});

describe('homePath', () => {
  it('derives the home route from the canonical route table', () => {
    expect(homePath()).toBe(APP_PATHS.home);
    expect(homePath()).toBe('/home');
  });
});
