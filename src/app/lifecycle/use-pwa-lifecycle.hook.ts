import { useEffect, useRef } from 'react';

import { getEnvironment } from '@/packages/environment';
import { useAppTranslation } from '@/packages/i18n';
import {
  getPlatformLogger,
  isNativeRuntime,
  registerPwaServiceWorker,
  reloadApplication,
} from '@/platform';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

/**
 * Registers the production web worker and presents an explicit, localized
 * restart action. The preservation callback is the seam where later approved
 * offline-write owners must flush or block before activation.
 */
export function usePwaLifecycle(): void {
  const { t } = useAppTranslation();
  const translateRef = useRef(t);
  const { showToast } = useAppToast();
  const showToastRef = useRef(showToast);
  useEffect(() => {
    translateRef.current = t;
    showToastRef.current = showToast;
  }, [t, showToast]);
  useEffect(() => {
    const environment = getEnvironment();
    const logger = getPlatformLogger('pwa');
    const lifecycle = registerPwaServiceWorker({
      enabled: environment.isProduction && !isNativeRuntime(),
      // Attendance and scorekeeping queues are not implemented yet. This
      // explicit gate must compose their preservation checks before they ship.
      preserveState: () => Promise.resolve(true),
      onUpdateReady: (applyUpdate) => {
        void showToastRef.current({
          message: translateRef.current(I18N_KEYS.pwa.updateReady),
          durationMs: 0,
          action: {
            label: translateRef.current(I18N_KEYS.pwa.updateAction),
            onSelect: () => {
              void applyUpdate();
            },
          },
        });
      },
      onUpdateBlocked: () => {
        void showToastRef.current({
          message: translateRef.current(I18N_KEYS.pwa.updateBlocked),
          tone: 'warning',
        });
      },
      onActivated: reloadApplication,
      onError: () => {
        logger.warn('PWA service worker lifecycle unavailable');
      },
    });
    return () => {
      lifecycle.dispose();
    };
  }, []);
}
