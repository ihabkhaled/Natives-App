import { useAppMutation } from '@/packages/query';

import { registerCandidate } from '../services/register-candidate.service';
import type { RegisterCandidateCommand, RegistrationResult } from '../types/tryouts.types';
import type { RegisterMutationView } from '../types/mutation.types';

/** Public registration. The result carries the reference or the duplicate flag. */
export function useRegisterCandidateMutation(
  onSettledResult: (result: RegistrationResult | null) => void,
): RegisterMutationView {
  const mutation = useAppMutation<RegistrationResult, RegisterCandidateCommand>({
    mutationFn: (command) => registerCandidate(command),
    onSuccess: onSettledResult,
    onError: () => {
      onSettledResult(null);
    },
  });
  return {
    run: (command) => {
      mutation.mutate(command);
    },
    isRunning: mutation.isPending,
  };
}
