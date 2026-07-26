import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { standingsQueryKeys } from '../queries/standings.keys';
import { createStandingsRule } from '../services/create-standings-rule.service';
import type { CreateStandingsRuleCommand, StandingsRule } from '../types/standings.types';
import type { StandingsMutationCallbacks } from '../types/standings-view.types';

/** Publish the next immutable version of a rule family. */
export function useCreateStandingsRuleMutation(
  teamId: string,
  callbacks: StandingsMutationCallbacks,
): InvalidatingMutationView<CreateStandingsRuleCommand> {
  return useInvalidatingMutation<StandingsRule, CreateStandingsRuleCommand>({
    mutationFn: (command) => createStandingsRule(teamId, command),
    invalidateKey: standingsQueryKeys.rules(teamId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
