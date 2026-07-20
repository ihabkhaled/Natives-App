import { useInvalidatingMutation } from '@/packages/query';

import { competitionsQueryKeys } from '../queries/competitions.keys';
import { declareSquadAvailability } from '../services/declare-squad-availability.service';
import type { DeclareAvailabilityCommand, SquadAvailability } from '../types/competitions.types';
import type { CompetitionsMutationCallbacks } from '../types/competitions-view.types';
import type { AvailabilityMutationView } from '../types/selection.types';

/** Declare the caller's own availability for one squad window. */
export function useDeclareAvailabilityMutation(
  teamId: string,
  squadId: string,
  callbacks: CompetitionsMutationCallbacks,
): AvailabilityMutationView {
  return useInvalidatingMutation<SquadAvailability, DeclareAvailabilityCommand>({
    mutationFn: (command) => declareSquadAvailability(teamId, squadId, command),
    invalidateKey: competitionsQueryKeys.squad(teamId, squadId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
