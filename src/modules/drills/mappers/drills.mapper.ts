import type { CreateDrillCommand, UpdateDrillCommand } from '../types/drills.types';

/**
 * The wire shape `CreateDrillDto`/`UpdateDrillDto` actually accept. Unlike the
 * response DTO, these are NOT nullable: an optional field is either a real
 * string/number or absent entirely. Sending `null` here is a validation
 * error, so "the coach left it blank" must become "the key is missing", not
 * "the key is null" — that collapse happens once, in this mapper.
 */
interface DrillWriteDto {
  readonly name: string;
  readonly category: string;
  readonly intensity: string;
  readonly objective?: string | undefined;
  readonly instructions?: string | undefined;
  readonly equipment: readonly string[];
  readonly skillTags: readonly string[];
  readonly defaultDurationMinutes?: number | undefined;
  readonly safetyNotes?: string | undefined;
  readonly mediaUrl?: string | undefined;
}

/** `undefined` drops the key when the client serializes the request body. */
function toOptionalString(value: string | null): string | undefined {
  return value ?? undefined;
}

function toWriteDto(fields: CreateDrillCommand | UpdateDrillCommand): DrillWriteDto {
  return {
    name: fields.name,
    category: fields.category,
    intensity: fields.intensity,
    objective: toOptionalString(fields.objective),
    instructions: toOptionalString(fields.instructions),
    equipment: fields.equipment,
    skillTags: fields.skillTags,
    defaultDurationMinutes: fields.defaultDurationMinutes ?? undefined,
    safetyNotes: toOptionalString(fields.safetyNotes),
    mediaUrl: toOptionalString(fields.mediaUrl),
  };
}

/** `CreateDrillDto`: the write fields plus the create-only `seasonId`. */
export function toCreateDrillDto(
  command: CreateDrillCommand,
): DrillWriteDto & { readonly seasonId?: string | undefined } {
  return { ...toWriteDto(command), seasonId: command.seasonId ?? undefined };
}

/** `UpdateDrillDto`: the write fields plus the optimistic-concurrency token. */
export function toUpdateDrillDto(
  command: UpdateDrillCommand,
): DrillWriteDto & { readonly expectedVersion: number } {
  return { ...toWriteDto(command), expectedVersion: command.expectedVersion };
}
