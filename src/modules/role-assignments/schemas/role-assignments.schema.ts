import { isoInstantField, schemaBuilder } from '@/packages/schema';

/**
 * Wire contracts for RBAC role assignments, shared by remote NestJS mode and
 * MSW mock mode.
 *
 * `roleKey` is a plain string and NEVER an enum. The role catalog is seeded
 * and extended server-side; narrowing it here would make a newly seeded role
 * fail to parse and disappear from the one screen whose entire job is showing
 * who holds what. The same reasoning applies to the assignable-roles slugs
 * below: this client renders whatever the server says it may grant.
 *
 * `teamId` and `seasonId` are nullable because a teamless assignment is
 * platform-wide. That distinction is load-bearing (see the row helper), so it
 * survives parsing as `null` rather than being flattened to an empty string.
 */
export const roleAssignmentResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  userId: schemaBuilder.string().min(1),
  roleKey: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().nullable(),
  seasonId: schemaBuilder.string().nullable(),
  effectiveFrom: isoInstantField,
  effectiveTo: schemaBuilder.string().nullable(),
  grantedBy: schemaBuilder.string().nullable(),
  revokedAt: schemaBuilder.string().nullable(),
  version: schemaBuilder.number(),
});

export const userAssignmentsResponseSchema = schemaBuilder.object({
  userId: schemaBuilder.string().min(1),
  assignments: schemaBuilder.array(roleAssignmentResponseSchema),
});

/**
 * The actor's own privilege ceiling, already resolved by the server. The
 * grant form offers exactly this list and nothing else — see the README.
 */
export const assignableRoleCatalogSchema = schemaBuilder.object({
  teamId: schemaBuilder.string().min(1),
  roles: schemaBuilder.array(
    schemaBuilder.object({
      slug: schemaBuilder.string().min(1),
      displayName: schemaBuilder.string(),
      description: schemaBuilder.string(),
    }),
  ),
});
