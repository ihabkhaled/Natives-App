import { describe, expect, it } from 'vitest';

import { APP_PATHS } from './app-paths.constants';

const VALUES = Object.values(APP_PATHS);

describe('APP_PATHS', () => {
  it('pins the canonical route table', () => {
    expect(APP_PATHS).toEqual({
      root: '/',
      welcome: '/welcome',
      login: '/login',
      home: '/home',
      settings: '/settings',
      workbench: '/workbench',
    });
  });

  it('anchors every path at the root', () => {
    expect(VALUES.filter((path) => !path.startsWith('/'))).toEqual([]);
  });

  it('avoids trailing slashes outside the root', () => {
    expect(VALUES.filter((path) => path !== APP_PATHS.root && path.endsWith('/'))).toEqual([]);
  });

  it('keeps every route unique', () => {
    expect(new Set(VALUES).size).toBe(VALUES.length);
  });
});
