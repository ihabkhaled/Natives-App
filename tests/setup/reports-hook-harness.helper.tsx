import { MemoryRouter } from 'react-router-dom';

import { createAppQueryClient, QueryClientProvider } from '@/packages/query';
import type { ReportsContextView } from '@/modules/reports/hooks/use-reports-context.hook';

/**
 * The provider tree, translate stub and context every reports hook spec needs.
 *
 * The two hook specs carried a byte-identical copy of all three. A fresh query
 * client per render keeps specs from sharing cache state.
 */
export function reportsHookWrapper({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <QueryClientProvider client={createAppQueryClient()}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

/** Identity translate: specs assert on catalog keys, never on rendered copy. */
export const translateKey = (key: string): string => key;

/** A team-scoped reader/generator, the default the specs exercise. */
export const REPORTS_CONTEXT: ReportsContextView = {
  teamId: 't1',
  isOffline: false,
  canRead: true,
  canGenerate: true,
  isLoading: false,
};
