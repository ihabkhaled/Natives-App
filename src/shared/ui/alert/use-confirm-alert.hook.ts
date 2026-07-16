import { useIonAlert } from '@/packages/ionic';

import type { ShowConfirmAlertOptions } from './alert.types';

export interface ConfirmAlertApi {
  readonly confirm: (options: ShowConfirmAlertOptions) => Promise<boolean>;
}

/** The alert owner. Resolves true only when the user confirms. */
export function useConfirmAlert(): ConfirmAlertApi {
  const [presentAlert] = useIonAlert();
  return {
    confirm: (options: ShowConfirmAlertOptions) =>
      new Promise<boolean>((resolve) => {
        void presentAlert({
          header: options.header,
          ...(options.message === undefined ? {} : { message: options.message }),
          buttons: [
            {
              text: options.cancelLabel,
              role: 'cancel',
              handler: () => {
                resolve(false);
              },
            },
            {
              text: options.confirmLabel,
              role: 'confirm',
              handler: () => {
                resolve(true);
              },
            },
          ],
          onDidDismiss: () => {
            resolve(false);
          },
        });
      }),
  };
}
