import { schemaBuilder } from '@/packages/schema';

import {
  SCOREKEEPER_OPERATION_KINDS,
  SCOREKEEPER_QUEUE_LIMIT,
  SCOREKEEPER_QUEUE_STATES,
  SCORING_SIDES,
} from '../constants/matches.constants';

const pointPayloadSchema = schemaBuilder.object({
  kind: schemaBuilder.literal('point'),
  scoringSide: schemaBuilder.enum(SCORING_SIDES),
  scorerMembershipId: schemaBuilder.string().nullable(),
  assistMembershipId: schemaBuilder.string().nullable(),
});

const timeoutPayloadSchema = schemaBuilder.object({
  kind: schemaBuilder.literal('timeout'),
  scoringSide: schemaBuilder.enum(SCORING_SIDES),
});

const voidPayloadSchema = schemaBuilder.object({
  kind: schemaBuilder.literal('void'),
  eventId: schemaBuilder.string().min(1),
  reason: schemaBuilder.string().min(1),
});

const payloadSchema = schemaBuilder.discriminatedUnion('kind', [
  pointPayloadSchema,
  timeoutPayloadSchema,
  voidPayloadSchema,
]);

const queuedOperationSchema = schemaBuilder.object({
  operationId: schemaBuilder.string().min(8),
  ownerUserId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  matchId: schemaBuilder.string().min(1),
  kind: schemaBuilder.enum(SCOREKEEPER_OPERATION_KINDS),
  payload: payloadSchema,
  payloadFingerprint: schemaBuilder.string().min(1),
  baseStreamVersion: schemaBuilder.number().int().nonnegative(),
  state: schemaBuilder.enum(SCOREKEEPER_QUEUE_STATES),
  retryCount: schemaBuilder.number().int().nonnegative(),
  conflictServerScore: schemaBuilder.string().nullable(),
  createdAtIso: schemaBuilder.iso.datetime({ offset: true }),
});

/**
 * The persisted queue. Bounded at the same limit the store enforces so a
 * hand-edited or corrupt payload can never restore an unbounded backlog.
 */
export const persistedScorekeeperQueueSchema = schemaBuilder.object({
  operations: schemaBuilder.array(queuedOperationSchema).max(SCOREKEEPER_QUEUE_LIMIT),
});
