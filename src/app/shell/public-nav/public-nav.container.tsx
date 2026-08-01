import { PublicNav } from './public-nav';
import { usePublicNav } from './use-public-nav.hook';

/**
 * Composes the global public navbar. Renders nothing once a session resolves
 * as authenticated, so signed-in screens keep the protected app bar only.
 */
export function PublicNavContainer(): React.JSX.Element | null {
  const view = usePublicNav();
  return <PublicNav {...view} />;
}
