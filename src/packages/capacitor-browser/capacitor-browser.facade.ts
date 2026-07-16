import { Browser } from '@capacitor/browser';

/**
 * Open an already-validated external URL in the in-app browser.
 * Callers must validate through the platform external-navigation owner.
 */
export async function openInAppBrowser(url: string): Promise<void> {
  await Browser.open({ url });
}
