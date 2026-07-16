import { useAppMutation, useQueryClient } from '@/packages/query';

import { logoutUser } from '../services/logout.service';
import { useSessionStore } from '../store/session.store';

export interface LogoutMutationView {
  readonly logout: () => void;
  readonly isLoggingOut: boolean;
}

/** Logout mutation: clears tokens, cached server state, and the session. */
export function useLogoutMutation(): LogoutMutationView {
  const queryClient = useQueryClient();
  const markAnonymous = useSessionStore((state) => state.markAnonymous);
  const mutation = useAppMutation<void, void>({
    mutationFn: () => logoutUser(),
    onSettled: () => {
      queryClient.clear();
      markAnonymous();
    },
  });
  return {
    logout: () => {
      mutation.mutate(undefined);
    },
    isLoggingOut: mutation.isPending,
  };
}
