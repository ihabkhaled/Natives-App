import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  settingsSnapshotPath,
  settingVersionPath,
  settingVersionsPath,
} from '../constants/admin-api.constants';
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

/**
 * The configuration the application reads at `asOf` (now when omitted). The
 * weights editor resolves the statuses effective at a chosen future instant
 * through the same read.
 */
export function requestSettingsSnapshot(teamId: string, asOf?: string): Promise<SnapshotDto> {
  return getAppHttpClient().get(settingsSnapshotPath(teamId), settingsSnapshotResponseSchema, {
    params: asOf === undefined ? {} : { asOf },
  });
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
      expectedHeadVersionId: command.expectedHeadVersionId,
    },
    settingVersionResponseSchema,
  );
}

/** Cancel a scheduled version while it is still in the future (204). */
export function requestCancelSettingVersion(teamId: string, versionId: string): Promise<void> {
  return getAppHttpClient().delete(settingVersionPath(teamId, versionId));
}
