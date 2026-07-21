import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import { settingsSnapshotPath, settingVersionsPath } from '../constants/admin-api.constants';
import { ADMIN_LIMITS } from '../constants/admin.constants';
import {
  settingsSnapshotResponseSchema,
  settingVersionListResponseSchema,
  settingVersionResponseSchema,
} from '../schemas/settings.schema';
import type { CreateSettingVersionCommand } from '../types/admin.types';

type SnapshotDto = SchemaOutput<typeof settingsSnapshotResponseSchema>;
type VersionListDto = SchemaOutput<typeof settingVersionListResponseSchema>;
type VersionDto = SchemaOutput<typeof settingVersionResponseSchema>;

/** The configuration the application reads today, with effective instants. */
export function requestSettingsSnapshot(teamId: string): Promise<SnapshotDto> {
  return getAppHttpClient().get(settingsSnapshotPath(teamId), settingsSnapshotResponseSchema);
}

export function requestSettingVersions(
  teamId: string,
  settingKey: string,
): Promise<VersionListDto> {
  return getAppHttpClient().get(settingVersionsPath(teamId), settingVersionListResponseSchema, {
    params: { settingKey, limit: ADMIN_LIMITS.settingVersions, offset: 0 },
  });
}

/** A new version never edits history; it takes effect at a chosen instant. */
export function requestCreateSettingVersion(
  teamId: string,
  command: CreateSettingVersionCommand,
): Promise<VersionDto> {
  return getAppHttpClient().post(
    settingVersionsPath(teamId),
    {
      settingKey: command.settingKey,
      effectiveFrom: command.effectiveFrom,
      value: command.value,
      note: command.note,
    },
    settingVersionResponseSchema,
  );
}
