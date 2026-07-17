import { IonReactRouter, IonRouterOutlet, Redirect, Route } from '@/packages/router';
import { APP_PATHS } from '@/shared/config';

import { AppLifecycle } from '../lifecycle/app-lifecycle.provider';
import { GuardedRoute } from './guarded-route.guard';
import { getAppRouteDefinitions, getCatchAllRouteDefinition } from './route-registry';

/** The single router composition: guards, module routes, root redirect, 404. */
export function AppRouter(): React.JSX.Element {
  const catchAll = getCatchAllRouteDefinition();
  return (
    <IonReactRouter>
      <AppLifecycle />
      <IonRouterOutlet>
        {getAppRouteDefinitions().map((definition) => (
          <Route
            key={definition.path}
            path={definition.path}
            exact={definition.exact}
            render={() => <GuardedRoute definition={definition} />}
          />
        ))}
        <Route exact path={APP_PATHS.root} render={() => <Redirect to={APP_PATHS.welcome} />} />
        <Route render={() => <GuardedRoute definition={catchAll} />} />
      </IonRouterOutlet>
    </IonReactRouter>
  );
}
