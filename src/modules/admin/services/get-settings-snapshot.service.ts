import { runRequest } from '@/shared/errors';

import { requestSettingsSnapshot } from '../gateways/settings.gateway';
import { mapSettingsSnapshot } from '../mappers/settings.mapper';
import type { SettingsSnapshot } from '../types/admin.types';

/** Use case: the effective configuration for a team, as of now. */
export function getSettingsSnapshot(teamId: string): Promise<SettingsSnapshot> {
  return runRequest(async () => mapSettingsSnapshot(await requestSettingsSnapshot(teamId)));
}
