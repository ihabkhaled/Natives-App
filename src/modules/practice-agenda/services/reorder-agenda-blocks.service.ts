import { requestBlockReorder } from '../gateways/practice-agenda.gateway';
import type { AgendaSummary, ReorderBlocksCommand } from '../types/practice-agenda.types';

/**
 * Commit the plan's running order; resolves the agenda header carrying the
 * version the reorder produced.
 */
export function reorderAgendaBlocks(command: ReorderBlocksCommand): Promise<AgendaSummary> {
  return requestBlockReorder(command);
}
