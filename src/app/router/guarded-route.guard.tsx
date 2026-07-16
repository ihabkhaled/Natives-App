import { Redirect } from '@/packages/router';
import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { ROUTE_ACCESS } from '@/shared/types';
import { LoadingState } from '@/shared/ui';

import { useRouteGuard } from './hooks/use-route-guard.hook';
import type { GuardedRouteProps } from './guarded-route.types';

/**
 * Session-aware route gate. Ownership of post-auth transitions lives here:
 * modules never navigate across module boundaries themselves.
 */
export function GuardedRoute(props: GuardedRouteProps): React.JSX.Element {
  const guard = useRouteGuard();
  if (!guard.isResolved) {
    return <LoadingState label={guard.loadingLabel} testId={TEST_IDS.globalLoading} />;
  }
  if (props.definition.access === ROUTE_ACCESS.Protected && !guard.isAuthenticated) {
    return <Redirect to={APP_PATHS.login} />;
  }
  if (props.definition.access === ROUTE_ACCESS.PublicOnly && guard.isAuthenticated) {
    return <Redirect to={APP_PATHS.home} />;
  }
  const Screen = props.definition.component;
  return <Screen />;
}
