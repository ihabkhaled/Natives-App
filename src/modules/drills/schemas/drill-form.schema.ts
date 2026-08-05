import { schemaBuilder } from '@/packages/schema';
import { I18N_KEYS } from '@/shared/i18n';

import { DRILL_FIELD_LIMITS } from '../constants/drills.constants';
import { isValidDurationInput } from '../helpers/drill-duration.helper';
import { parseTagList } from '../helpers/drill-tag-list.helper';

const keys = I18N_KEYS.drills;

/**
 * An optional media link: blank means "no clip attached", and anything else
 * must be an `https://` URL. Plain `http://` and every other scheme are
 * rejected because the value ends up as a link a teammate clicks — a
 * `javascript:` or `data:` value would be a stored-content attack, not a typo.
 */
const mediaUrlField = schemaBuilder
  .string()
  .trim()
  .max(DRILL_FIELD_LIMITS.mediaUrlMax, keys.validationMediaUrlTooLong)
  .refine((value) => value === '' || value.startsWith('https://'), keys.validationMediaUrlInvalid);

/**
 * A comma-separated tag line. Validation counts the parsed items against the
 * wire's `maxItems`, but the field itself stays a string — `useAppForm`
 * requires the schema's output type to match the form's field type, so the
 * split into an array happens later, in `helpers/drill-form.helper.ts`.
 */
function tagListField(
  maxItems: number,
  messageKey: string,
): ReturnType<typeof schemaBuilder.string> {
  return schemaBuilder
    .string()
    .refine((value) => parseTagList(value).length <= maxItems, messageKey);
}

const durationField = schemaBuilder
  .string()
  .refine(isValidDurationInput, keys.validationDurationRange);

/**
 * Drill form validation, bounds mirrored from the backend create/update DTOs
 * so a coach never meets a client rule the server would not also enforce.
 * Messages are i18n KEYS, translated by the form hook.
 */
export const drillFormSchema = schemaBuilder.object({
  name: schemaBuilder
    .string()
    .trim()
    .min(DRILL_FIELD_LIMITS.nameMin, keys.validationNameRequired)
    .max(DRILL_FIELD_LIMITS.nameMax, keys.validationNameTooLong),
  category: schemaBuilder.string().min(1, keys.validationCategoryRequired),
  intensity: schemaBuilder.string().min(1, keys.validationCategoryRequired),
  objective: schemaBuilder
    .string()
    .max(DRILL_FIELD_LIMITS.objectiveMax, keys.validationObjectiveTooLong),
  instructions: schemaBuilder
    .string()
    .max(DRILL_FIELD_LIMITS.instructionsMax, keys.validationInstructionsTooLong),
  equipment: tagListField(DRILL_FIELD_LIMITS.equipmentMaxItems, keys.validationEquipmentTooMany),
  skillTags: tagListField(DRILL_FIELD_LIMITS.skillTagsMaxItems, keys.validationSkillTagsTooMany),
  defaultDurationMinutes: durationField,
  safetyNotes: schemaBuilder
    .string()
    .max(DRILL_FIELD_LIMITS.safetyNotesMax, keys.validationSafetyNotesTooLong),
  mediaUrl: mediaUrlField,
});
