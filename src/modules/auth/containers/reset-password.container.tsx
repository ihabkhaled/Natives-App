import { ResetPasswordView } from '../components/reset-password-view';
import { useResetPasswordScreen } from '../hooks/use-reset-password-screen.hook';

/** Reset-password screen: view model in, presentational component out. */
export function ResetPasswordContainer(): React.JSX.Element {
  const screen = useResetPasswordScreen();
  return <ResetPasswordView {...screen} />;
}
