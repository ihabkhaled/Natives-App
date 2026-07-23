import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import {
  buildCatalogQueryOptions,
  buildSeasonsQueryOptions,
  buildSettingsSnapshotQueryOptions,
  buildSettingVersionsQueryOptions,
  buildVenuesQueryOptions,
} from '../queries/admin.query';
import type {
  CatalogEntry,
  Season,
  SettingsSnapshot,
  SettingVersionPage,
  Venue,
} from '../types/admin.types';

export interface SettingsResourcesView {
  readonly snapshot: RemoteQueryView<SettingsSnapshot>;
  readonly versions: RemoteQueryView<SettingVersionPage>;
  readonly seasons: RemoteQueryView<readonly Season[]>;
  readonly venues: RemoteQueryView<readonly Venue[]>;
  readonly catalog: RemoteQueryView<readonly CatalogEntry[]>;
  /** The position catalog, always loaded: roster caps select from it. */
  readonly positions: RemoteQueryView<readonly CatalogEntry[]>;
}

/**
 * The bounded reads the settings screen composes. Each is normalized to
 * the shared remote-query shape so no raw backend error escapes into a view.
 */
export function useSettingsResources(
  teamId: string,
  settingKey: string,
  catalog: string,
): SettingsResourcesView {
  return {
    snapshot: toRemoteQueryView(
      useAppQuery<SettingsSnapshot>(buildSettingsSnapshotQueryOptions(teamId)),
    ),
    versions: toRemoteQueryView(
      useAppQuery<SettingVersionPage>(buildSettingVersionsQueryOptions(teamId, settingKey)),
    ),
    seasons: toRemoteQueryView(useAppQuery<readonly Season[]>(buildSeasonsQueryOptions(teamId))),
    venues: toRemoteQueryView(useAppQuery<readonly Venue[]>(buildVenuesQueryOptions(teamId))),
    catalog: toRemoteQueryView(
      useAppQuery<readonly CatalogEntry[]>(buildCatalogQueryOptions(teamId, catalog)),
    ),
    positions: toRemoteQueryView(
      useAppQuery<readonly CatalogEntry[]>(buildCatalogQueryOptions(teamId, 'position')),
    ),
  };
}
