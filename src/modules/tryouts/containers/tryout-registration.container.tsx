import { TryoutRegistrationView } from '../components/tryout-registration-view';
import { useTryoutRegistration } from '../hooks/use-tryout-registration.hook';

/** The public candidate registration screen. */
export function TryoutRegistrationContainer(): React.JSX.Element {
  const view = useTryoutRegistration();
  return <TryoutRegistrationView {...view} />;
}
