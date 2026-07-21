import { runRequest } from '@/shared/errors';

import { requestSettingVersions } from '../gateways/settings.gateway';
import { mapSettingVersionPage } from '../mappers/settings.mapper';
import type { SettingVersionPage } from '../types/admin.types';

/** Use case: one bounded page of effective-dated versions for a key. */
export function listSettingVersions(
  teamId: string,
  settingKey: string,
): Promise<SettingVersionPage> {
  return runRequest(async () =>
    mapSettingVersionPage(await requestSettingVersions(teamId, settingKey)),
  );
}
