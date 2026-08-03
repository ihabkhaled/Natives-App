import type { AgendaBlock, AgendaState, PracticeAgenda } from '../types/practice-agenda.types';

/**
 * A running order a coach drew but the server has not confirmed yet, tagged
 * with the agenda version it was drawn against.
 */
export interface PendingBlockOrder {
  readonly version: number | null;
  readonly ids: readonly string[];
}

/**
 * The plan's blocks and the version they were read at, defaulted once so the
 * screen never has to ask twice whether the read has landed.
 */
export function resolveAgendaState(agenda: PracticeAgenda | undefined): AgendaState {
  return {
    blocks: agenda?.blocks ?? [],
    version: agenda?.version ?? null,
  };
}

/** The server's own running order: `position` is the field of record. */
function byPosition(blocks: readonly AgendaBlock[]): readonly AgendaBlock[] {
  return [...blocks].sort((left, right) => left.position - right.position);
}

/**
 * Blocks arranged by an id list. Ids the server no longer knows are dropped,
 * and blocks the list never mentioned are kept at the end — a block another
 * coach added while this one was reordering must not vanish from the plan.
 */
function orderByIds(
  blocks: readonly AgendaBlock[],
  ids: readonly string[],
): readonly AgendaBlock[] {
  const named = ids
    .map((id) => blocks.find((block) => block.id === id))
    .filter((block): block is AgendaBlock => block !== undefined);
  const unnamed = blocks.filter((block) => !ids.includes(block.id));
  return [...named, ...unnamed];
}

/**
 * The order to draw right now.
 *
 * A pending order survives only while it still describes the agenda version on
 * screen. The moment the server reports a new version — which every accepted
 * reorder produces — the coach's provisional order is discarded and the
 * server's answer takes over. That is the whole reconciliation: immediate on
 * screen, but never the last word.
 */
export function resolveBlockOrder(
  blocks: readonly AgendaBlock[],
  pending: PendingBlockOrder | null,
  version: number | null,
): readonly AgendaBlock[] {
  const authoritative = byPosition(blocks);
  if (pending?.version !== version) {
    return authoritative;
  }
  return orderByIds(authoritative, pending.ids);
}

/** The ids of a block list, in the order it is drawn. */
export function toBlockIds(blocks: readonly AgendaBlock[]): readonly string[] {
  return blocks.map((block) => block.id);
}
