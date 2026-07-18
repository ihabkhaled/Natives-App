import { LoginView } from '../components/login-view';
import { useLoginScreen } from '../hooks/use-login-screen.hook';

/** Login screen: view model in, presentational component out. */
export function LoginContainer(): React.JSX.Element {
  const screen = useLoginScreen();
  return <LoginView {...screen} />;
}
