import { TEST_IDS } from '@/shared/config';

import { AppComponent } from '../app.component';
import { AppErrorBoundary } from '../error-boundaries/app-error-boundary.boundary';
import { AppProviders } from '../providers/app-providers.provider';
import { AppRouter } from '../router/app-router.routes';
import { OfflineBannerContainer } from './offline-banner/offline-banner.container';

/** Complete application composition, rendered by main.tsx after startup. */
export function AppShell(): React.JSX.Element {
  return (
    <AppProviders>
      <AppComponent>
        <AppErrorBoundary>
          <div className="flex h-full flex-col" data-testid={TEST_IDS.appShell}>
            <OfflineBannerContainer />
            <div className="relative flex-1">
              <AppRouter />
            </div>
          </div>
        </AppErrorBoundary>
      </AppComponent>
    </AppProviders>
  );
}
