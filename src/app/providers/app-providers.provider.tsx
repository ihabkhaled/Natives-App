import type { ReactNode } from 'react';

import { getEnvironment } from '@/packages/environment';
import { QueryClientProvider, ReactQueryDevtools } from '@/packages/query';

import { getAppQueryClient } from '../bootstrap/query-client.factory';
import { AppearanceSync } from './appearance-sync.provider';

export interface AppProvidersProps {
  readonly children: ReactNode;
}

/** Cross-cutting providers: server-state client, appearance sync, devtools. */
export function AppProviders(props: AppProvidersProps): React.JSX.Element {
  const environment = getEnvironment();
  const devtoolsEnabled = environment.enableQueryDevtools && environment.isDevelopment;
  return (
    <QueryClientProvider client={getAppQueryClient()}>
      <AppearanceSync />
      {props.children}
      {devtoolsEnabled ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
