import type { SchemaOutput } from '@/packages/schema';

import type { invitationDetailsDtoSchema } from '../schemas/auth.schema';
import type { InvitationDetails } from '../types/auth.types';

/** Pure DTO → domain mapping for a pending invitation. */
export function mapInvitationDtoToDetails(
  dto: SchemaOutput<typeof invitationDetailsDtoSchema>,
): InvitationDetails {
  return {
    email: dto.email.toLowerCase(),
    role: dto.role,
    inviterName: dto.inviterName === null ? null : dto.inviterName.trim(),
    expiresAtIso: dto.expiresAt,
  };
}
