import { useEffect, useRef } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { applyDocumentTitle, focusElementById } from '@/platform';
import { TEST_IDS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

import { findActiveRoute } from '../active-route.helper';
import { getAppRouteDefinitions } from '../route-registry';

/**
 * Page chrome for every route change: set the document title from the active
 * route's metadata (falling back to the app name) and, on in-app navigation,
 * restore focus to the main-content landmark so keyboard and screen-reader
 * users land at the top of the new screen. Focus is deliberately not moved on
 * the first render, so the initial Tab still reaches the skip link.
 */
export function useRouteChrome(): void {
  const navigation = useAppNavigation();
  const { t } = useAppTranslation();
  const path = navigation.currentPath;
  const isInitialRender = useRef(true);
  useEffect(() => {
    const active = findActiveRoute(getAppRouteDefinitions(), path);
    const titleKey = active?.meta?.titleKey;
    applyDocumentTitle(titleKey === undefined ? t(I18N_KEYS.common.appName) : t(titleKey));
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    focusElementById(TEST_IDS.mainContent);
  }, [path, t]);
}
