import { requestInvitationDetails } from '../gateways/auth.gateway';
import { mapInvitationDtoToDetails } from '../mappers/invitation.mapper';
import type { InvitationDetails } from '../types/auth.types';
import { mapAuthLinkError } from './map-auth-link-error.helper';

/**
 * Use case: look up a pending invitation by its opaque token so the acceptance
 * screen can show who invited the user and to which team.
 */
export async function getInvitation(token: string): Promise<InvitationDetails> {
  try {
    const dto = await requestInvitationDetails(token);
    return mapInvitationDtoToDetails(dto);
  } catch (error) {
    throw mapAuthLinkError(error);
  }
}
