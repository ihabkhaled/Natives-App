import { useAppQuery } from '@/packages/query';
import { type AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { buildInvitationQueryOptions } from '../queries/invitation.query';
import type { InvitationDetails } from '../types/auth.types';

export interface InvitationQueryView {
  readonly invitation: InvitationDetails | undefined;
  readonly isLoading: boolean;
  readonly error: AppError | null;
}

/** Looks up a pending invitation by token; disabled while the token is empty. */
export function useInvitationQuery(token: string): InvitationQueryView {
  const query = useAppQuery<InvitationDetails>(buildInvitationQueryOptions(token));
  return {
    invitation: query.data,
    isLoading: query.isLoading,
    error: query.error === null ? null : toAppError(query.error),
  };
}
