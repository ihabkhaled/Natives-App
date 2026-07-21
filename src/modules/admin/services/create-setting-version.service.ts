import { runRequest } from '@/shared/errors';

import { requestCreateSettingVersion } from '../gateways/settings.gateway';
import type { CreateSettingVersionCommand } from '../types/admin.types';

/** Use case: schedule an effective-dated configuration change. */
export function createSettingVersion(
  teamId: string,
  command: CreateSettingVersionCommand,
): Promise<string> {
  return runRequest(async () => (await requestCreateSettingVersion(teamId, command)).id);
}
