/**
 * Copy plain text to the system clipboard.
 *
 * Returns false rather than throwing when the browser refuses — an insecure
 * origin, a denied permission, or (contrary to the DOM lib's types) no
 * Clipboard API at all, which is why the guard is a runtime one. The caller's
 * job is to keep the value visible and selectable either way, never to lose it.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await globalThis.navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
