import { useAppMutation } from '@/packages/query';

import { registerCandidate } from '../services/register-candidate.service';
import type { RegisterCandidateCommand, RegistrationResult } from '../types/tryouts.types';
import type { RegisterMutationCallbacks, RegisterMutationView } from '../types/mutation.types';

/**
 * Public registration. A server answer — registered, waitlisted, or duplicate
 * — travels through `onResult`; a failed call reports `onFailure`, so the
 * screen can say nothing was saved instead of rendering a blank success.
 */
export function useRegisterCandidateMutation(
  callbacks: RegisterMutationCallbacks,
): RegisterMutationView {
  const mutation = useAppMutation<RegistrationResult, RegisterCandidateCommand>({
    mutationFn: (command) => registerCandidate(command),
    onSuccess: callbacks.onResult,
    onError: callbacks.onFailure,
  });
  return {
    run: (command) => {
      mutation.mutate(command);
    },
    isRunning: mutation.isPending,
  };
}
