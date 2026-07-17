/** Full application reload; the error boundary's last-resort recovery. */
export function reloadApplication(): void {
  globalThis.location.reload();
}
