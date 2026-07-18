import { useCurrentUserQuery } from '@/modules/auth';

export interface AttendanceTeamContextView {
  readonly teamId: string;
  readonly isLoading: boolean;
  readonly isError: boolean;
}

export function useAttendanceTeamContext(): AttendanceTeamContextView {
  const currentUser = useCurrentUserQuery();
  return {
    teamId: currentUser.user?.memberships[0]?.teamId ?? '',
    isLoading: currentUser.isLoading,
    isError: currentUser.isError,
  };
}
