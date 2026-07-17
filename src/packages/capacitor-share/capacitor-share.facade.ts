import { Share } from '@capacitor/share';

export interface ShareRequest {
  readonly title?: string;
  readonly text?: string;
  readonly url?: string;
}

/** Returns false when sharing is unavailable or the user cancels. */
export async function shareContent(request: ShareRequest): Promise<boolean> {
  try {
    await Share.share(request);
    return true;
  } catch {
    return false;
  }
}
