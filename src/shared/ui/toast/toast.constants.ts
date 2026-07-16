import type { ToastTone } from './toast.types';

export const TOAST_TONE_TO_ION_COLOR: Record<ToastTone, string | undefined> = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  neutral: undefined,
};

export const TOAST_DEFAULT_DURATION_MS = 2500;
