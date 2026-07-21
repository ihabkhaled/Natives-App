import {
  isoDateField,
  isoInstantField,
  pagedEnvelopeFields,
  schemaBuilder,
} from '@/packages/schema';

import {
  CATALOG_KINDS,
  CATALOG_STATUSES,
  SEASON_STATUSES,
  SETTING_KEYS,
  VENUE_STATUSES,
} from '../constants/admin.constants';

/**
 * Wire contracts for team settings, seasons, venues, and catalogs. A setting
 * value is opaque JSON by design — the client renders it as text and never
 * interprets a shape it does not own.
 */
const settingValueField = schemaBuilder.unknown();

const effectiveSettingSchema = schemaBuilder.object({
  settingKey: schemaBuilder.enum(SETTING_KEYS),
  effectiveFrom: isoInstantField.nullable(),
  value: settingValueField,
});

export const settingsSnapshotResponseSchema = schemaBuilder.object({
  teamId: schemaBuilder.string().min(1),
  asOf: isoInstantField,
  settings: schemaBuilder.array(effectiveSettingSchema),
});

export const settingVersionResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  settingKey: schemaBuilder.enum(SETTING_KEYS),
  effectiveFrom: isoInstantField,
  value: settingValueField,
  note: schemaBuilder.string().nullable(),
  createdBy: schemaBuilder.string().nullable(),
  createdAt: isoInstantField,
});

export const settingVersionListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(settingVersionResponseSchema),
  ...pagedEnvelopeFields,
});

const seasonResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  slug: schemaBuilder.string().min(1),
  name: schemaBuilder.string().min(1),
  startsOn: isoDateField,
  endsOn: isoDateField,
  status: schemaBuilder.enum(SEASON_STATUSES),
  version: schemaBuilder.number().int().nonnegative(),
});

export const seasonListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(seasonResponseSchema),
  ...pagedEnvelopeFields,
});

const venueResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  name: schemaBuilder.string().min(1),
  address: schemaBuilder.string().nullable(),
  timezone: schemaBuilder.string().min(1),
  status: schemaBuilder.enum(VENUE_STATUSES),
  version: schemaBuilder.number().int().nonnegative(),
});

export const venueListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(venueResponseSchema),
  ...pagedEnvelopeFields,
});

const catalogEntryResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  catalog: schemaBuilder.enum(CATALOG_KINDS),
  key: schemaBuilder.string().min(1),
  label: schemaBuilder.string().min(1),
  sortOrder: schemaBuilder.number().int().nonnegative(),
  referenceCount: schemaBuilder.number().int().nonnegative(),
  status: schemaBuilder.enum(CATALOG_STATUSES),
  version: schemaBuilder.number().int().nonnegative(),
});

export const catalogEntryListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(catalogEntryResponseSchema),
  ...pagedEnvelopeFields,
});
