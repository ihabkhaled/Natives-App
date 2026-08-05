import { I18N_KEYS } from '@/shared/i18n';

const KEYS = I18N_KEYS.practiceSchedules;

/**
 * The three outcomes a generation run can report, in the order they are
 * shown. A run that created nothing new is still an explicit sentence — never
 * a silent no-op the coach has to infer from an unchanged screen.
 */
export const SCHEDULE_GENERATE_COPY_KEYS = {
  created: KEYS.generateCreated,
  createdWithSkipped: KEYS.generateCreatedWithSkipped,
  nothingNew: KEYS.generateNothingNew,
  nothingToGenerate: KEYS.generateNothingToGenerate,
} as const;
