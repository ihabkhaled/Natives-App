import { useIonToast } from '@/packages/ionic';

import type { ShowToastOptions, ToastTone } from './toast.types';

const TONE_TO_COLOR: Record<ToastTone, string | undefined> = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  neutral: undefined,
};

export interface AppToastApi {
  readonly showToast: (options: ShowToastOptions) => Promise<void>;
}

/** The toast owner. Features never present Ionic toasts directly. */
export function useAppToast(): AppToastApi {
  const [presentToast] = useIonToast();
  return {
    showToast: async (options: ShowToastOptions) => {
      const color = TONE_TO_COLOR[options.tone ?? 'neutral'];
      await presentToast({
        message: options.message,
        duration: options.durationMs ?? 2500,
        position: 'bottom',
        ...(color === undefined ? {} : { color }),
      });
    },
  };
}
