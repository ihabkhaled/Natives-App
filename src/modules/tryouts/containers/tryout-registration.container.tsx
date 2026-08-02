import { PublicTryoutsView } from '../components/public-tryouts-view';
import { usePublicTryouts } from '../hooks/use-public-tryouts.hook';

/** The public tryouts screen: open sessions plus the application form. */
export function TryoutRegistrationContainer(): React.JSX.Element {
  const view = usePublicTryouts();
  return <PublicTryoutsView {...view} />;
}
