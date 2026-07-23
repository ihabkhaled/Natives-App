import { isoInstantField, schemaBuilder } from '@/packages/schema';

/**
 * Wire contracts for the platform super-admin roster (contract 1.2.0).
 * Assignments are RBAC-owned: every entry names who granted it and since
 * when, because the roster is an audited privilege surface, not a directory.
 */
export const superAdminEntryResponseSchema = schemaBuilder.object({
  assignmentId: schemaBuilder.string().min(1),
  userId: schemaBuilder.string().min(1),
  email: schemaBuilder.string().min(1),
  displayName: schemaBuilder.string().nullable(),
  effectiveFrom: isoInstantField,
  grantedBy: schemaBuilder.string().nullable(),
});

export const superAdminListResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(superAdminEntryResponseSchema),
  total: schemaBuilder.number().int().nonnegative(),
});
