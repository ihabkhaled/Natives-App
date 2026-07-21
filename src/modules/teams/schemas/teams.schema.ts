import {
  isoDateField,
  isoInstantField,
  pagedEnvelopeFields,
  schemaBuilder,
} from '@/packages/schema';

import { SEASON_STATUSES, TEAM_STATUSES } from '../constants/teams.constants';

/** Exact runtime mirrors of the NestJS teams DTOs. */
export const teamResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  slug: schemaBuilder.string().min(1),
  name: schemaBuilder.string().min(1),
  locale: schemaBuilder.string().min(1),
  timezone: schemaBuilder.string().min(1),
  primaryColor: schemaBuilder.string().nullable(),
  logoMediaKey: schemaBuilder.string().nullable(),
  status: schemaBuilder.enum(TEAM_STATUSES),
  createdBy: schemaBuilder.string().nullable(),
  updatedBy: schemaBuilder.string().nullable(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
  version: schemaBuilder.number(),
});

export const teamListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(teamResponseSchema),
  ...pagedEnvelopeFields,
});

/**
 * A season, parsed down to the fields the app actually uses. The audit columns
 * the API also returns (createdBy/updatedBy/createdAt/updatedAt) are
 * deliberately NOT required: nothing reads them, and requiring a field no
 * screen renders only creates a way for the boundary to fail on data that is
 * perfectly usable.
 */
export const seasonResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  slug: schemaBuilder.string().min(1),
  name: schemaBuilder.string().min(1),
  startsOn: isoDateField,
  endsOn: isoDateField,
  status: schemaBuilder.enum(SEASON_STATUSES),
  version: schemaBuilder.number(),
});

export const seasonListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(seasonResponseSchema),
  ...pagedEnvelopeFields,
});

/**
 * The seeded RBAC catalog: every permission with the area it belongs to, and
 * every role bundle with the permission keys it grants. `policyVersion` stamps
 * the snapshot so a stale matrix is visibly stale.
 */
export const roleMatrixResponseSchema = schemaBuilder.object({
  policyVersion: schemaBuilder.number(),
  permissions: schemaBuilder.array(
    schemaBuilder.object({
      key: schemaBuilder.string().min(1),
      area: schemaBuilder.string().min(1),
      description: schemaBuilder.string(),
    }),
  ),
  roles: schemaBuilder.array(
    schemaBuilder.object({
      key: schemaBuilder.string().min(1),
      displayName: schemaBuilder.string().min(1),
      description: schemaBuilder.string(),
      isSystem: schemaBuilder.boolean(),
      permissions: schemaBuilder.array(schemaBuilder.string()),
    }),
  ),
});
