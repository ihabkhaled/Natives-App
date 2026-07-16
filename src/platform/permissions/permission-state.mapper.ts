export const PERMISSION_STATUS = {
  Granted: 'granted',
  Denied: 'denied',
  NeedsRequest: 'needs-request',
  Unknown: 'unknown',
} as const;

export type PermissionStatus = (typeof PERMISSION_STATUS)[keyof typeof PERMISSION_STATUS];

/**
 * Normalize Capacitor plugin permission states into the app taxonomy.
 * Optional capability plugins (camera, geolocation, …) must route their
 * raw states through this mapper when they are installed.
 */
export function mapRawPermissionState(rawState: string): PermissionStatus {
  if (rawState === 'granted' || rawState === 'limited') {
    return PERMISSION_STATUS.Granted;
  }
  if (rawState === 'denied') {
    return PERMISSION_STATUS.Denied;
  }
  if (rawState === 'prompt' || rawState === 'prompt-with-rationale') {
    return PERMISSION_STATUS.NeedsRequest;
  }
  return PERMISSION_STATUS.Unknown;
}
