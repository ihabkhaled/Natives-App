import type { SchemaOutput } from '@/packages/schema';

import type {
  DRILL_CATEGORIES,
  DRILL_INTENSITIES,
  DRILL_STATUSES,
} from '../constants/drills.constants';
import type { drillResponseSchema, listDrillsResponseSchema } from '../schemas/drills.schema';

export type DrillCategory = (typeof DRILL_CATEGORIES)[number];
export type DrillIntensity = (typeof DRILL_INTENSITIES)[number];
export type DrillStatus = (typeof DRILL_STATUSES)[number];

export type Drill = SchemaOutput<typeof drillResponseSchema>;
export type DrillsPage = SchemaOutput<typeof listDrillsResponseSchema>;

/** One bounded page request against the team's drill catalogue. */
export interface DrillsQuery {
  readonly teamId: string;
  readonly limit: number;
  readonly offset: number;
}

/**
 * The fields a coach controls when writing a drill. `intensity` is required
 * here even though the wire DTO marks it optional: the form always offers a
 * real choice (defaulted to `moderate`), so this module never has to model
 * "the coach did not pick one" as a third state.
 */
export interface DrillFields {
  readonly name: string;
  readonly category: DrillCategory;
  readonly intensity: DrillIntensity;
  readonly objective: string | null;
  readonly instructions: string | null;
  readonly equipment: readonly string[];
  readonly skillTags: readonly string[];
  readonly defaultDurationMinutes: number | null;
  readonly safetyNotes: string | null;
  readonly mediaUrl: string | null;
}

/** `seasonId` is create-only: the wire contract offers no way to change it later. */
export interface CreateDrillCommand extends DrillFields {
  readonly teamId: string;
  readonly seasonId: string | null;
}

/** `expectedVersion` is the optimistic guard: a stale edit is refused, not merged. */
export interface UpdateDrillCommand extends DrillFields {
  readonly teamId: string;
  readonly drillId: string;
  readonly expectedVersion: number;
}

export interface ArchiveDrillCommand {
  readonly teamId: string;
  readonly drillId: string;
}

/**
 * The create/edit form's field values. Every field is a plain string — the
 * form layer (`@/packages/forms`) binds only strings — even for `category`,
 * `intensity` and `defaultDurationMinutes`, which are narrowed to their
 * domain types only once, in `helpers/drill-form.helper.ts`, when the
 * submitted values become a command.
 */
export interface DrillFormValues {
  readonly name: string;
  readonly category: string;
  readonly intensity: string;
  readonly objective: string;
  readonly instructions: string;
  readonly equipment: string;
  readonly skillTags: string;
  readonly defaultDurationMinutes: string;
  readonly safetyNotes: string;
  readonly mediaUrl: string;
}
