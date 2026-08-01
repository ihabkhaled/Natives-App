import { ForgotPasswordView } from '../components/forgot-password-view';
import { useForgotPasswordScreen } from '../hooks/use-forgot-password-screen.hook';

/** Forgot-password screen: view model in, presentational component out. */
export function ForgotPasswordContainer(): React.JSX.Element {
  const screen = useForgotPasswordScreen();
  return <ForgotPasswordView {...screen} />;
}
