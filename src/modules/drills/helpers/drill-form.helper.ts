import { DRILL_DEFAULT_INTENSITY } from '../constants/drills.constants';
import type {
  CreateDrillCommand,
  Drill,
  DrillCategory,
  DrillFields,
  DrillFormValues,
  DrillIntensity,
  UpdateDrillCommand,
} from '../types/drills.types';
import { parseDurationInput } from './drill-duration.helper';
import { formatTagList, parseTagList } from './drill-tag-list.helper';

/** A blank optional field means "not set"; anything else is kept, trimmed. */
function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/** A brand-new drill: every field blank, intensity defaulted to a real choice. */
const BLANK_DRILL_FORM_VALUES: DrillFormValues = {
  name: '',
  category: '',
  intensity: DRILL_DEFAULT_INTENSITY,
  objective: '',
  instructions: '',
  equipment: '',
  skillTags: '',
  defaultDurationMinutes: '',
  safetyNotes: '',
  mediaUrl: '',
};

/** Seed the form from a loaded drill, or start blank when creating one. */
export function buildDrillFormDefaultValues(drill: Drill | null): DrillFormValues {
  if (drill === null) {
    return BLANK_DRILL_FORM_VALUES;
  }
  return {
    name: drill.name,
    category: drill.category,
    intensity: drill.intensity,
    objective: drill.objective ?? '',
    instructions: drill.instructions ?? '',
    equipment: formatTagList(drill.equipment),
    skillTags: formatTagList(drill.skillTags),
    defaultDurationMinutes:
      drill.defaultDurationMinutes === null ? '' : String(drill.defaultDurationMinutes),
    safetyNotes: drill.safetyNotes ?? '',
    mediaUrl: drill.mediaUrl ?? '',
  };
}

/**
 * Narrow the submitted strings into the domain fields every write command
 * shares. Validated by `drillFormSchema` before this ever runs, so `category`
 * and `intensity` are guaranteed non-empty vocabulary values here.
 */
function toDrillFields(values: DrillFormValues): DrillFields {
  return {
    name: values.name.trim(),
    category: values.category as DrillCategory,
    intensity: values.intensity as DrillIntensity,
    objective: blankToNull(values.objective),
    instructions: blankToNull(values.instructions),
    equipment: parseTagList(values.equipment),
    skillTags: parseTagList(values.skillTags),
    defaultDurationMinutes: parseDurationInput(values.defaultDurationMinutes),
    safetyNotes: blankToNull(values.safetyNotes),
    mediaUrl: blankToNull(values.mediaUrl),
  };
}

/**
 * `seasonId` has no field in this form: the wire contract offers no way to
 * change it after creation, and exposing a bare UUID picker for it is out of
 * this module's scope. A drill created here is always team-level.
 */
export function toCreateDrillCommand(teamId: string, values: DrillFormValues): CreateDrillCommand {
  return { teamId, seasonId: null, ...toDrillFields(values) };
}

export function toUpdateDrillCommand(
  teamId: string,
  drillId: string,
  expectedVersion: number,
  values: DrillFormValues,
): UpdateDrillCommand {
  return { teamId, drillId, expectedVersion, ...toDrillFields(values) };
}
