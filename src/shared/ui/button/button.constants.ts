import type { AppButtonTone } from './button.types';

/**
 * Tone to Ionic colour role. `secondary` resolves to the cool slate tonal role
 * so supporting actions never render as Ionic's dead grey `medium` default.
 */
export const BUTTON_TONE_TO_ION_COLOR: Record<AppButtonTone, string> = {
  primary: 'primary',
  secondary: 'secondary',
  ghost: 'medium',
  danger: 'danger',
};

/** Ghost buttons drop the filled surface and pick up the text-only treatment. */
export const BUTTON_TONE_TO_CLASS: Record<AppButtonTone, string> = {
  primary: '',
  secondary: '',
  ghost: 'app-button--ghost',
  danger: '',
};
