import { useAppQuery } from '@/packages/query';
import { type AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { buildMemberProfileQueryOptions } from '../queries/member-profile.query';
import type { MemberProfile } from '../types/members.types';

export interface MemberProfileQueryView {
  readonly profile: MemberProfile | undefined;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly refetch: () => void;
}

/** Loads one audience-shaped member profile with a normalized AppError. */
export function useMemberProfileQuery(
  teamId: string,
  membershipId: string,
): MemberProfileQueryView {
  const query = useAppQuery(buildMemberProfileQueryOptions(teamId, membershipId));
  return {
    profile: query.data,
    isLoading: query.isPending,
    error: query.error === null ? null : toAppError(query.error),
    refetch: () => {
      void query.refetch();
    },
  };
}
