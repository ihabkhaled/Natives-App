/**
 * Canonical route table. Modules expose typed builders in their
 * routes/*.paths.ts files derived from these values; raw route strings are
 * forbidden everywhere else (ESLint: architecture/no-inline-routes).
 */
export const APP_PATHS = {
  root: '/',
  welcome: '/welcome',
  login: '/login',
  home: '/home',
  admin: '/admin',
  settings: '/settings',
  workbench: '/workbench',
} as const;

export type AppPath = (typeof APP_PATHS)[keyof typeof APP_PATHS];
