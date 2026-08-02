import { IonReactRouter, IonRouterOutlet, Route } from '@/packages/router';

import { AppLifecycle } from '../lifecycle/app-lifecycle.provider';
import { AppBarContainer } from '../shell/app-bar/app-bar.container';
import { PrimaryNavigationContainer } from '../shell/navigation/primary-navigation.container';
import { PublicFooterContainer } from '../shell/public-footer/public-footer.container';
import { PublicNavContainer } from '../shell/public-nav/public-nav.container';
import { GuardedRoute } from './guarded-route.guard';
import { RouteChrome } from './route-chrome.provider';
import { getAppRouteDefinitions, getCatchAllRouteDefinition } from './route-registry';

/**
 * The single router composition: chrome, guards, module routes, 404. `/` is
 * a normal registered route (the public landing page, owned by the home
 * module) — it needs no special-cased redirect here.
 */
export function AppRouter(): React.JSX.Element {
  const catchAll = getCatchAllRouteDefinition();
  return (
    <IonReactRouter>
      <AppLifecycle />
      <RouteChrome />
      <AppBarContainer />
      <PublicNavContainer />
      <IonRouterOutlet>
        {getAppRouteDefinitions().map((definition) => (
          <Route
            key={definition.path}
            path={definition.path}
            exact={definition.exact}
            render={() => <GuardedRoute definition={definition} />}
          />
        ))}
        <Route render={() => <GuardedRoute definition={catchAll} />} />
      </IonRouterOutlet>
      <PrimaryNavigationContainer />
      <PublicFooterContainer />
    </IonReactRouter>
  );
}
