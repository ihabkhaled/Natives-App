import { hideSplashScreen } from '@/packages/capacitor-splash-screen';
import { applyStatusBarAppearance, STATUS_BAR_APPEARANCE } from '@/packages/capacitor-status-bar';

import { isNativeRuntime } from '../runtime/runtime.facade';

/**
 * Native chrome policy: status bar follows the resolved theme and the
 * splash screen hides after first render. A web no-op.
 */
export async function applyNativeChrome(options: { readonly isDarkTheme: boolean }): Promise<void> {
  if (!isNativeRuntime()) {
    return;
  }
  await applyStatusBarAppearance(
    options.isDarkTheme ? STATUS_BAR_APPEARANCE.Dark : STATUS_BAR_APPEARANCE.Light,
  );
  await hideSplashScreen();
}
