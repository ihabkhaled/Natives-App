import { Keyboard } from '@capacitor/keyboard';

/** Best-effort keyboard dismissal; a no-op on desktop web. */
export async function hideKeyboard(): Promise<void> {
  try {
    await Keyboard.hide();
  } catch {
    // The keyboard plugin is unavailable in this runtime; intentionally ignored.
  }
}
