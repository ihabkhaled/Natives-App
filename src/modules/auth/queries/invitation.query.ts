import { getInvitation } from '../services/get-invitation.service';
import { authQueryKeys } from './auth.keys';

/** Query options builder: pending invitation details for a token. */
export function buildInvitationQueryOptions(token: string) {
  return {
    queryKey: authQueryKeys.invitation(token),
    queryFn: () => getInvitation(token),
    enabled: token !== '',
    retry: false,
  };
}
