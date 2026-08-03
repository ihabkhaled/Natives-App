import type { SchemaOutput } from '@/packages/schema';

import type {
  assignableRoleCatalogSchema,
  roleAssignmentResponseSchema,
  userAssignmentsResponseSchema,
} from '../schemas/role-assignments.schema';

export type RoleAssignment = SchemaOutput<typeof roleAssignmentResponseSchema>;
export type UserAssignments = SchemaOutput<typeof userAssignmentsResponseSchema>;
export type AssignableRoleCatalog = SchemaOutput<typeof assignableRoleCatalogSchema>;
export type AssignableRole = AssignableRoleCatalog['roles'][number];

/**
 * A grant. The scope travels as a team (and optionally a season) because this
 * screen never mints a platform-wide grant: a teamless assignment is the
 * super-admin privilege, which `src/modules/admin` grants through its own
 * audited, reason-bearing flow.
 */
export interface AssignRoleCommand {
  readonly userId: string;
  readonly roleKey: string;
  readonly teamId: string;
  readonly seasonId: string | null;
}
