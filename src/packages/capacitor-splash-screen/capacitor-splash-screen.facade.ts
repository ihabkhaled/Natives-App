import { SplashScreen } from '@capacitor/splash-screen';

/** Hidden by platform startup once the shell has rendered. */
export async function hideSplashScreen(): Promise<void> {
  try {
    await SplashScreen.hide();
  } catch {
    // The splash screen is unavailable in this runtime; intentionally ignored.
  }
}
