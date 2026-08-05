import type { ShowConfirmAlertOptions } from '@/shared/ui';

/**
 * Run a command only once the coach has confirmed it. Shared by delete and
 * generate — both are destructive-adjacent enough to need the same "are you
 * sure" gate, so the gate itself is written once.
 */
export function confirmThenRun(
  confirm: (options: ShowConfirmAlertOptions) => Promise<boolean>,
  options: ShowConfirmAlertOptions,
  run: () => void,
): void {
  void confirm(options).then((confirmed) => {
    if (confirmed) {
      run();
    }
  });
}
