import { PrimaryNavigation } from './primary-navigation';
import { usePrimaryNavigation } from './use-primary-navigation.hook';

/**
 * Composes the primary navigation. Renders nothing until a resolved,
 * authenticated session has at least one permitted destination, so anonymous
 * and loading states never show navigation chrome.
 */
export function PrimaryNavigationContainer(): React.JSX.Element | null {
  const view = usePrimaryNavigation();
  return <PrimaryNavigation {...view} />;
}
