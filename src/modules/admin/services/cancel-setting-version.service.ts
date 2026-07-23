import { runRequest } from '@/shared/errors';

import { requestCancelSettingVersion } from '../gateways/settings.gateway';

/**
 * Use case: cancel a scheduled configuration change while it is still in the
 * future. A version already in effect is history and is refused with 409.
 */
export function cancelSettingVersion(teamId: string, versionId: string): Promise<void> {
  return runRequest(() => requestCancelSettingVersion(teamId, versionId));
}
