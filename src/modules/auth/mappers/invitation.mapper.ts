import type { SchemaOutput } from '@/packages/schema';

import type { invitationDetailsDtoSchema } from '../schemas/auth.schema';
import type { InvitationDetails } from '../types/auth.types';

/** Pure DTO → domain mapping for a pending invitation. */
export function mapInvitationDtoToDetails(
  dto: SchemaOutput<typeof invitationDetailsDtoSchema>,
): InvitationDetails {
  return {
    email: dto.email.toLowerCase(),
    teamName: dto.teamName.trim(),
    inviterName: dto.inviterName.trim(),
    expiresAtIso: dto.expiresAt,
  };
}
