import { useIonToast } from '@/packages/ionic';

import { TOAST_DEFAULT_DURATION_MS, TOAST_TONE_TO_ION_COLOR } from './toast.constants';
import type { ShowToastOptions } from './toast.types';

export interface AppToastApi {
  readonly showToast: (options: ShowToastOptions) => Promise<void>;
}

/** The toast owner. Features never present Ionic toasts directly. */
export function useAppToast(): AppToastApi {
  const [presentToast] = useIonToast();
  return {
    showToast: async (options: ShowToastOptions) => {
      const color = TOAST_TONE_TO_ION_COLOR[options.tone ?? 'neutral'];
      await presentToast({
        message: options.message,
        duration: options.durationMs ?? TOAST_DEFAULT_DURATION_MS,
        position: 'bottom',
        ...(color === undefined ? {} : { color }),
      });
    },
  };
}
