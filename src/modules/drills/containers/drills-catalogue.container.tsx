import { DrillsCatalogueView } from '../components/drills-catalogue-view';
import { useDrillsCatalogueScreen } from '../hooks/use-drills-catalogue-screen.hook';

/** Routed drill catalogue list screen. */
export function DrillsCatalogueContainer(): React.JSX.Element {
  const view = useDrillsCatalogueScreen();
  return <DrillsCatalogueView {...view} />;
}
