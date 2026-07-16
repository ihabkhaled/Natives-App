import { useEffect, useRef } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useIonRouter } from '@/packages/router';
import {
  getPlatformLogger,
  registerHardwareBackHandler,
  startDeepLinkListener,
  subscribeToAppLifecycle,
} from '@/platform';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { APP_DEEP_LINK_POLICY } from '../router/deep-link-policy.constants';

/**
 * One owner for native runtime listeners: hardware back, deep links, and
 * foreground/background transitions. Everything unsubscribes on unmount.
 */
export function useAppLifecycle(): void {
  const ionRouter = useIonRouter();
  const routerRef = useRef(ionRouter);
  const { t } = useAppTranslation();
  const translateRef = useRef(t);
  const { showToast } = useAppToast();
  const showToastRef = useRef(showToast);
  useEffect(() => {
    routerRef.current = ionRouter;
    translateRef.current = t;
    showToastRef.current = showToast;
  }, [ionRouter, t, showToast]);
  useEffect(() => {
    const logger = getPlatformLogger('lifecycle');
    const cleanupBackButton = registerHardwareBackHandler({
      canGoBack: () => routerRef.current.canGoBack(),
      goBack: () => {
        routerRef.current.goBack();
      },
    });
    const cleanupDeepLinks = startDeepLinkListener({
      policy: APP_DEEP_LINK_POLICY,
      onNavigate: (path) => {
        routerRef.current.push(path, 'root', 'replace');
      },
      onRejected: () => {
        void showToastRef.current({
          message: translateRef.current(I18N_KEYS.errors.deepLinkRejected),
          tone: 'warning',
        });
      },
    });
    const cleanupAppState = subscribeToAppLifecycle({
      onForeground: () => {
        logger.debug('app moved to foreground');
      },
      onBackground: () => {
        logger.debug('app moved to background');
      },
    });
    return () => {
      cleanupBackButton();
      cleanupDeepLinks();
      cleanupAppState();
    };
  }, []);
}
