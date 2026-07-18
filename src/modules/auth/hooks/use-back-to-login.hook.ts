import { useAppNavigation } from '@/packages/router';

import { loginPath } from '../routes/auth.paths';

/** Returns a handler that navigates back to sign-in from a public recovery flow. */
export function useBackToLogin(): () => void {
  const navigation = useAppNavigation();
  return () => {
    navigation.push(loginPath());
  };
}
