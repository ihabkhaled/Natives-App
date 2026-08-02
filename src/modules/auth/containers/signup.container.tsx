import { SignupView } from '../components/signup-view';
import { useSignupScreen } from '../hooks/use-signup-screen.hook';

/** Signup screen: view model in, presentational component out. */
export function SignupContainer(): React.JSX.Element {
  const screen = useSignupScreen();
  return <SignupView {...screen} />;
}
