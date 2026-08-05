import { pagedEnvelopeFields, schemaBuilder } from '@/packages/schema';

import { DRILL_CATEGORIES, DRILL_INTENSITIES, DRILL_STATUSES } from '../constants/drills.constants';

/**
 * Wire contract for `DrillResponseDto`, shared by remote NestJS mode and MSW
 * mock mode.
 *
 * Every optional field is `nullable()` rather than `optional()`: the OpenAPI
 * document marks `seasonId`, `objective`, `instructions`, `defaultDurationMinutes`,
 * `safetyNotes` and `mediaUrl` both REQUIRED and nullable, so "not set" always
 * arrives as an explicit `null`, never an absent key. `category`, `intensity`
 * and `status` are the opposite case — required and never null — so a coach
 * always has a real value to render for them.
 */
export const drillResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  seasonId: schemaBuilder.string().nullable(),
  name: schemaBuilder.string().min(1),
  category: schemaBuilder.enum(DRILL_CATEGORIES),
  objective: schemaBuilder.string().nullable(),
  instructions: schemaBuilder.string().nullable(),
  equipment: schemaBuilder.array(schemaBuilder.string()),
  intensity: schemaBuilder.enum(DRILL_INTENSITIES),
  defaultDurationMinutes: schemaBuilder.number().nullable(),
  skillTags: schemaBuilder.array(schemaBuilder.string()),
  safetyNotes: schemaBuilder.string().nullable(),
  mediaUrl: schemaBuilder.string().nullable(),
  status: schemaBuilder.enum(DRILL_STATUSES),
  /** Optimistic-concurrency token; a stale `expectedVersion` on update is a 409. */
  version: schemaBuilder.number(),
});

/** One bounded page of the team's drill catalogue. */
export const listDrillsResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(drillResponseSchema),
  ...pagedEnvelopeFields,
});
