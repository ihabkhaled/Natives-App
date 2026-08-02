import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';
import { PERMISSIONS } from '@/shared/security';
import { ROUTE_ACCESS } from '@/shared/types';

import { getNewsRouteDefinitions } from './news.routes';

const routes = getNewsRouteDefinitions();

describe('getNewsRouteDefinitions', () => {
  it('declares the literal editor path BEFORE the slug pattern that shadows it', () => {
    // `/news/:slug` also matches "/news/manage"; the router renders the first
    // match, so a swapped order would send an editor to an article detail.
    expect(routes.map((route) => route.path)).toEqual([
      APP_PATHS.news,
      APP_PATHS.newsManage,
      APP_PATHS.newsArticle,
    ]);
  });

  it('leaves both public reads unauthenticated', () => {
    expect(routes[0]?.access).toBe(ROUTE_ACCESS.Public);
    expect(routes[2]?.access).toBe(ROUTE_ACCESS.Public);
    expect(routes[0]?.meta).toBeUndefined();
    expect(routes[2]?.meta).toBeUndefined();
  });

  it('gates the newsroom on the exact backend permission string', () => {
    const editor = routes[1];

    expect(editor?.access).toBe(ROUTE_ACCESS.Protected);
    expect(editor?.meta?.permissions).toEqual([PERMISSIONS.newsManage]);
    expect(editor?.meta?.permissions[0]).toBe('news.manage');
  });

  it('puts the newsroom in the sidebar so the same grant hides it from a player', () => {
    expect(routes[1]?.meta?.nav?.group).toBe('manage');
    expect(routes[1]?.meta?.requiresTeamContext).toBe(false);
  });

  it('mounts a component for every route', () => {
    for (const route of routes) {
      expect(route.component).toBeTypeOf('function');
      expect(route.exact).toBe(true);
    }
  });
});
