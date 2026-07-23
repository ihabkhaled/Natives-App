import { seasonResponseSchema as teamsSeasonResponseSchema } from '@/modules/teams';
import { isoInstantField, pagedEnvelopeFields, schemaBuilder } from '@/packages/schema';

import {
  CATALOG_KINDS,
  CATALOG_STATUSES,
  SETTING_KEYS,
  VENUE_STATUSES,
} from '../constants/admin.constants';
import { SETTING_VALUE_STATES } from '../constants/setting-values.constants';

/**
 * Wire contracts for team settings, seasons, venues, and catalogs. A setting
 * value is typed per key since contract 1.3.0: the mapper parses a `valid`
 * document through the per-key union, keeps a `legacy` document raw behind
 * an explicit wrapper, and the snapshot never serves a legacy value as
 * effective (helpers/setting-value-state.helper.ts).
 */
const effectiveSettingSchema = schemaBuilder.object({
  settingKey: schemaBuilder.enum(SETTING_KEYS),
  effectiveFrom: isoInstantField.nullable(),
  value: schemaBuilder.unknown(),
  valueState: schemaBuilder.enum(SETTING_VALUE_STATES).nullable(),
  issues: schemaBuilder.array(schemaBuilder.string()),
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
  value: schemaBuilder.unknown(),
  valueState: schemaBuilder.enum(SETTING_VALUE_STATES),
  note: schemaBuilder.string().nullable(),
  createdBy: schemaBuilder.string().nullable(),
  createdAt: isoInstantField,
});

export const settingVersionListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(settingVersionResponseSchema),
  ...pagedEnvelopeFields,
});

// Seasons belong to the teams module, which owns their lifecycle. The settings
// screen only READS them, so it parses through that module's schema rather than
// keeping a second definition of the same wire shape in step with it.
export const seasonListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(teamsSeasonResponseSchema),
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
