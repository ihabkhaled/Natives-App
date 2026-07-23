import type { SchemaOutput } from '@/packages/schema';

import type {
  superAdminEntryResponseSchema,
  superAdminListResponseSchema,
} from '../schemas/platform-admins.schema';
import type { SuperAdmin, SuperAdminRoster } from '../types/admin.types';

type SuperAdminEntryDto = SchemaOutput<typeof superAdminEntryResponseSchema>;
type SuperAdminListDto = SchemaOutput<typeof superAdminListResponseSchema>;

/** Pure DTO → domain mapping for one super-admin assignment. */
export function mapSuperAdmin(dto: SuperAdminEntryDto): SuperAdmin {
  return {
    assignmentId: dto.assignmentId,
    userId: dto.userId,
    email: dto.email,
    displayName: dto.displayName,
    effectiveFromIso: dto.effectiveFrom,
    grantedBy: dto.grantedBy,
  };
}

export function mapSuperAdminRoster(dto: SuperAdminListDto): SuperAdminRoster {
  return {
    items: dto.items.map(mapSuperAdmin),
    total: dto.total,
  };
}
