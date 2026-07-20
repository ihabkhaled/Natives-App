import { AppBar } from './app-bar';
import { useAppBar } from './use-app-bar.hook';

/**
 * Composes the global top app bar. Renders nothing until a resolved,
 * authenticated session exists, so anonymous and loading screens stay
 * full-bleed.
 */
export function AppBarContainer(): React.JSX.Element | null {
  const view = useAppBar();
  return <AppBar {...view} />;
}
