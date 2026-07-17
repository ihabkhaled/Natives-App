import { openInAppBrowser } from '@/packages/capacitor-browser';

/** Open an already-validated URL. Validation happens in external-navigation. */
export async function openUrlInAppBrowser(url: URL): Promise<void> {
  await openInAppBrowser(url.toString());
}
