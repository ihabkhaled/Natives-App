import { useInvalidatingMutation } from '@/packages/query';

import { competitionsQueryKeys } from '../queries/competitions.keys';
import { overrideSelectSquadPlayer } from '../services/override-select-squad-player.service';
import { removeSquadSelection } from '../services/remove-squad-selection.service';
import { selectSquadPlayer } from '../services/select-squad-player.service';
import type { SquadSelection } from '../types/competitions.types';
import type { CompetitionsMutationCallbacks } from '../types/competitions-view.types';
import type { SelectionCommand, SelectionMutationView } from '../types/selection.types';

function runCommand(
  teamId: string,
  squadId: string,
  command: SelectionCommand,
): Promise<SquadSelection> {
  if (command.intent === 'remove') {
    return removeSquadSelection(teamId, squadId, command.membershipId);
  }
  if (command.intent === 'override') {
    return overrideSelectSquadPlayer(teamId, squadId, {
      membershipId: command.membershipId,
      selectionRole: 'player',
      reason: null,
      overrideReason: command.overrideReason,
    });
  }
  return selectSquadPlayer(teamId, squadId, {
    membershipId: command.membershipId,
    selectionRole: 'player',
    reason: null,
  });
}

/**
 * Select, override-select, or remove one player, then refresh the squad's
 * eligibility and selection caches so the advisory report stays truthful.
 */
export function useSelectPlayerMutation(
  teamId: string,
  squadId: string,
  callbacks: CompetitionsMutationCallbacks,
): SelectionMutationView {
  return useInvalidatingMutation<SquadSelection, SelectionCommand>({
    mutationFn: (command) => runCommand(teamId, squadId, command),
    invalidateKey: competitionsQueryKeys.squad(teamId, squadId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
