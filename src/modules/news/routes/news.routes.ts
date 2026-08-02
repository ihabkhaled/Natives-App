import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { NewsArticleContainer } from '../containers/news-article.container';
import { NewsEditorContainer } from '../containers/news-editor.container';
import { NewsListContainer } from '../containers/news-list.container';
import { newsArticlePattern, newsManagePath, newsPath } from './news.paths';

/**
 * Public, not PublicOnly: club news reads the same signed in or out, and the
 * backend serves it unauthenticated.
 *
 * ORDER MATTERS. `/news/manage` is declared before `/news/:slug` because the
 * router renders the FIRST matching Route: with the slug pattern first, an
 * editor opening the newsroom would land on an article detail for the slug
 * "manage". `app-paths.constants.test.ts` pins that ordering too.
 *
 * The editor is Protected AND gated on `news.manage`, so the guard resolves a
 * session without the grant to the designed forbidden state rather than the
 * screen — and its nav entry is filtered out of the sidebar by the same
 * permission, which is why a plain player never even sees the destination.
 */
export function getNewsRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: newsPath(),
      exact: true,
      access: ROUTE_ACCESS.Public,
      component: NewsListContainer,
    },
    {
      path: newsManagePath(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: NewsEditorContainer,
      meta: {
        key: 'news-manage',
        titleKey: I18N_KEYS.newsEditor.title,
        permissions: [PERMISSIONS.newsManage],
        requiresTeamContext: false,
        offline: false,
        preload: false,
        featureFlag: null,
        nav: {
          order: 70,
          group: NAV_GROUP.Manage,
          iconName: 'clipboard',
          labelKey: I18N_KEYS.newsEditor.navLabel,
        },
      },
    },
    {
      path: newsArticlePattern(),
      exact: true,
      access: ROUTE_ACCESS.Public,
      component: NewsArticleContainer,
    },
  ];
}
