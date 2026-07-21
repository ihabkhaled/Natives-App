import { schemaBuilder } from '@/packages/schema';

/**
 * Wire contract for the backend derived-statistics projection (504).
 *
 * Every per-player measure is nullable on purpose. `null` means the event
 * stream cannot support the number (no lineups were recorded, for example) and
 * the UI must say "not enough data"; `0` means the server measured zero. The
 * two are never collapsed.
 */

export const playerMatchStatisticsSchema = schemaBuilder.object({
  membershipId: schemaBuilder.string().min(1),
  rosterEntryId: schemaBuilder.string().nullable(),
  rostered: schemaBuilder.boolean(),
  pointsPlayed: schemaBuilder.number().int().nullable(),
  offencePointsPlayed: schemaBuilder.number().int().nullable(),
  defencePointsPlayed: schemaBuilder.number().int().nullable(),
  goals: schemaBuilder.number().int().nullable(),
  assists: schemaBuilder.number().int().nullable(),
  callahans: schemaBuilder.number().int().nullable(),
  drops: schemaBuilder.number().int().nullable(),
  throwaways: schemaBuilder.number().int().nullable(),
  blocks: schemaBuilder.number().int().nullable(),
  opponentErrorsForced: schemaBuilder.number().int().nullable(),
});

export const teamMatchStatisticsSchema = schemaBuilder.object({
  pointsStarted: schemaBuilder.number().int().nonnegative(),
  pointsCompleted: schemaBuilder.number().int().nonnegative(),
  holds: schemaBuilder.number().int().nonnegative(),
  breaks: schemaBuilder.number().int().nonnegative(),
  opponentHolds: schemaBuilder.number().int().nonnegative(),
  opponentBreaks: schemaBuilder.number().int().nonnegative(),
  goalsFor: schemaBuilder.number().int().nonnegative(),
  goalsAgainst: schemaBuilder.number().int().nonnegative(),
  drops: schemaBuilder.number().int().nullable(),
  throwaways: schemaBuilder.number().int().nullable(),
  blocks: schemaBuilder.number().int().nullable(),
  turnovers: schemaBuilder.number().int().nullable(),
  opponentErrors: schemaBuilder.number().int().nullable(),
});

export const matchStatisticsResponseSchema = schemaBuilder.object({
  matchId: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  rulesetKey: schemaBuilder.string().min(1),
  rulesetVersion: schemaBuilder.number().int().nonnegative(),
  statsEngineVersion: schemaBuilder.string().min(1),
  lineupsRecorded: schemaBuilder.boolean(),
  playsRecorded: schemaBuilder.boolean(),
  opponentErrorAttribution: schemaBuilder.boolean(),
  team: teamMatchStatisticsSchema,
  players: schemaBuilder.array(playerMatchStatisticsSchema),
});
