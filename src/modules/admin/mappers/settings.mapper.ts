import type { SchemaOutput } from '@/packages/schema';

import { resolveEffectiveValue, wrapVersionValue } from '../helpers/setting-value-state.helper';
import type {
  catalogEntryListResponseSchema,
  seasonListResponseSchema,
  settingsSnapshotResponseSchema,
  settingVersionListResponseSchema,
  venueListResponseSchema,
} from '../schemas/settings.schema';
import type {
  CatalogEntry,
  Season,
  SettingsSnapshot,
  SettingVersionPage,
  Venue,
} from '../types/admin.types';

type SnapshotDto = SchemaOutput<typeof settingsSnapshotResponseSchema>;
type VersionListDto = SchemaOutput<typeof settingVersionListResponseSchema>;
type SeasonListDto = SchemaOutput<typeof seasonListResponseSchema>;
type VenueListDto = SchemaOutput<typeof venueListResponseSchema>;
type CatalogListDto = SchemaOutput<typeof catalogEntryListResponseSchema>;

export function mapSettingsSnapshot(dto: SnapshotDto): SettingsSnapshot {
  return {
    asOf: dto.asOf,
    settings: dto.settings.map((setting) => ({
      settingKey: setting.settingKey,
      effectiveFrom: setting.effectiveFrom,
      value: resolveEffectiveValue(setting),
      valueState: setting.valueState,
      issues: setting.issues,
    })),
  };
}

export function mapSettingVersionPage(dto: VersionListDto): SettingVersionPage {
  return {
    total: dto.total,
    items: dto.items.map((item) => ({
      id: item.id,
      settingKey: item.settingKey,
      effectiveFrom: item.effectiveFrom,
      value: wrapVersionValue(item),
      note: item.note,
      createdBy: item.createdBy,
      createdAt: item.createdAt,
    })),
  };
}

export function mapSeasons(dto: SeasonListDto): readonly Season[] {
  return dto.items.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    startsOn: item.startsOn,
    endsOn: item.endsOn,
    status: item.status,
  }));
}

export function mapVenues(dto: VenueListDto): readonly Venue[] {
  return dto.items.map((item) => ({
    id: item.id,
    name: item.name,
    address: item.address,
    timezone: item.timezone,
    status: item.status,
  }));
}

export function mapCatalogEntries(dto: CatalogListDto): readonly CatalogEntry[] {
  return dto.items.map((item) => ({
    id: item.id,
    catalog: item.catalog,
    key: item.key,
    label: item.label,
    referenceCount: item.referenceCount,
    status: item.status,
  }));
}
