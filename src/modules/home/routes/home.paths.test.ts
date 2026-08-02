import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import { aboutPath, homePath, rootPath, welcomePath } from './home.paths';

describe('rootPath', () => {
  it('derives the public landing page from the canonical route table', () => {
    expect(rootPath()).toBe(APP_PATHS.root);
    expect(rootPath()).toBe('/');
  });
});

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
