import { useAppMutation, useQueryClient } from '@/packages/query';

import { authQueryKeys } from '../queries/auth.keys';
import { revokeOtherSessions } from '../services/revoke-other-sessions.service';
import { revokeSession } from '../services/revoke-session.service';

export interface SessionRevocationView {
  readonly revokeOne: (sessionId: string) => void;
  readonly revokeOthers: () => void;
  readonly isRevoking: boolean;
}

interface UseSessionRevocationOptions {
  /** Invoked after a successful revoke, so the screen can confirm with a toast. */
  readonly onSuccess: () => void;
  /** Invoked when a revoke call fails, so the screen can surface a toast. */
  readonly onError: () => void;
}

/**
 * Session-revocation mutations. Both refresh the session list on success and
 * report the outcome through the caller-supplied handlers; neither touches
 * tokens (signing out the current device stays a plain logout).
 */
export function useSessionRevocationMutation(
  options: UseSessionRevocationOptions,
): SessionRevocationView {
  const queryClient = useQueryClient();
  const settleSuccess = (): void => {
    void queryClient.invalidateQueries({ queryKey: authQueryKeys.sessions() });
    options.onSuccess();
  };
  const one = useAppMutation<boolean, string>({
    mutationFn: async (sessionId) => {
      await revokeSession(sessionId);
      return true;
    },
    onSuccess: settleSuccess,
    onError: options.onError,
  });
  const others = useAppMutation<number, undefined>({
    mutationFn: () => revokeOtherSessions(),
    onSuccess: settleSuccess,
    onError: options.onError,
  });
  return {
    revokeOne: (sessionId) => {
      one.mutate(sessionId);
    },
    revokeOthers: () => {
      others.mutate(undefined);
    },
    isRevoking: one.isPending || others.isPending,
  };
}
