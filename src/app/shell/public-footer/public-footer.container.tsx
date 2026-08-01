import { PublicFooter } from './public-footer';
import { usePublicFooter } from './use-public-footer.hook';

/**
 * Composes the global public footer. Renders nothing once a session resolves
 * as authenticated.
 */
export function PublicFooterContainer(): React.JSX.Element | null {
  const view = usePublicFooter();
  return <PublicFooter {...view} />;
}
