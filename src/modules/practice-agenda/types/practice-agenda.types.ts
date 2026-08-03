import type { SchemaOutput } from '@/packages/schema';

import type {
  AGENDA_BLOCK_TYPES,
  AGENDA_COMPLETION_STATUSES,
  AGENDA_INTENSITIES,
  AGENDA_STATUSES,
} from '../constants/practice-agenda.constants';
import type {
  agendaBlockResponseSchema,
  agendaResponseSchema,
  agendaStationResponseSchema,
  agendaSummaryResponseSchema,
} from '../schemas/practice-agenda.schema';

export type AgendaStatus = (typeof AGENDA_STATUSES)[number];
export type AgendaBlockType = (typeof AGENDA_BLOCK_TYPES)[number];
export type AgendaCompletionStatus = (typeof AGENDA_COMPLETION_STATUSES)[number];
export type AgendaIntensity = (typeof AGENDA_INTENSITIES)[number];

export type AgendaStation = SchemaOutput<typeof agendaStationResponseSchema>;
export type AgendaBlock = SchemaOutput<typeof agendaBlockResponseSchema>;
export type PracticeAgenda = SchemaOutput<typeof agendaResponseSchema>;
export type AgendaSummary = SchemaOutput<typeof agendaSummaryResponseSchema>;

/** Which session's plan to read; the agenda is always session-scoped. */
export interface AgendaRequestParams {
  readonly teamId: string;
  readonly sessionId: string;
}

/**
 * A whole-plan reorder. The server takes the complete id list, not a delta, so
 * a block the coach never touched cannot be dropped by an incomplete command.
 * `expectedVersion` is the optimistic guard: null only while the agenda has no
 * version yet, otherwise the version the coach was looking at when they moved.
 */
export interface ReorderBlocksCommand {
  readonly teamId: string;
  readonly sessionId: string;
  readonly blockIds: readonly string[];
  readonly expectedVersion: number | null;
}

export interface RemoveStationCommand {
  readonly teamId: string;
  readonly sessionId: string;
  readonly blockId: string;
  readonly stationId: string;
}

/** The blocks and the version they were read at, defaulted once. */
export interface AgendaState {
  readonly blocks: readonly AgendaBlock[];
  readonly version: number | null;
}
