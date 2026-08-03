import { I18N_KEYS } from '@/shared/i18n';
import { SHARED_SCREEN_COPY_KEYS } from '@/shared/view';

/** The AsyncStateView copy block for the agenda plan. */
export const PRACTICE_AGENDA_SCREEN_COPY_KEYS = {
  loadingLabel: I18N_KEYS.practiceAgenda.loadingLabel,
  ...SHARED_SCREEN_COPY_KEYS,
} as const;

/**
 * Controls of the shared reorder primitive. The primitive owns the affordance,
 * so it reuses the primitive's own generic copy rather than inventing a second
 * wording for "move up". Row-specific labels ("Move Warm-up up") would need an
 * interpolated key this module was not given — see the README.
 */
export const PRACTICE_AGENDA_CONTROL_KEYS = {
  moveUp: I18N_KEYS.settingEditors.moveUp,
  moveDown: I18N_KEYS.settingEditors.moveDown,
  removeStation: I18N_KEYS.settingEditors.remove,
} as const;
