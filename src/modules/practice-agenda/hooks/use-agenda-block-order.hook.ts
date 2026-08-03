import { useState } from 'react';

import { moveArrayItem } from '@/shared/ui';

import {
  resolveBlockOrder,
  toBlockIds,
  type PendingBlockOrder,
} from '../helpers/agenda-order.helper';
import type { AgendaMutationScope } from '../mutations/practice-agenda-mutations.types';
import { useReorderBlocksMutation } from '../mutations/use-reorder-blocks-mutation.hook';
import type { AgendaBlock } from '../types/practice-agenda.types';

export interface AgendaBlockOrderInput {
  readonly scope: AgendaMutationScope;
  readonly blocks: readonly AgendaBlock[];
  readonly version: number | null;
  readonly onSaved: () => void;
  readonly onFailed: () => void;
}

export interface AgendaBlockOrderView {
  readonly blocks: readonly AgendaBlock[];
  readonly isSaving: boolean;
  readonly move: (index: number, offset: -1 | 1) => void;
}

/**
 * The plan's running order while a coach is rearranging it.
 *
 * A move redraws immediately — a coach adjusting a session that is already
 * running cannot wait for a round trip to see what they did — and posts the
 * whole id list with the version it was drawn against. The provisional order
 * is then given up in both directions: an accepted move bumps the version, so
 * `resolveBlockOrder` discards it in favour of the re-read plan, and a refused
 * one clears it outright so the coach sees the order that actually holds
 * rather than the one they wanted.
 */
export function useAgendaBlockOrder(input: AgendaBlockOrderInput): AgendaBlockOrderView {
  const [pending, setPending] = useState<PendingBlockOrder | null>(null);

  const reorder = useReorderBlocksMutation(input.scope, {
    onSuccess: input.onSaved,
    onError: (): void => {
      setPending(null);
      input.onFailed();
    },
  });

  const blocks = resolveBlockOrder(input.blocks, pending, input.version);

  return {
    blocks,
    isSaving: reorder.isRunning,
    move: (index: number, offset: -1 | 1): void => {
      const current = toBlockIds(blocks);
      const next = moveArrayItem(current, index, offset);
      // An out-of-range move is the same list back; posting it would spend a
      // version bump on a plan nobody changed.
      if (next !== current) {
        setPending({ version: input.version, ids: next });
        reorder.run({ blockIds: next, expectedVersion: input.version });
      }
    },
  };
}
