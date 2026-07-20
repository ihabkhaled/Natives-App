import { useAppMutation, useQueryClient } from '@/packages/query';
import { APP_ERROR_CODE } from '@/shared/errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { patchProfileOptimistically } from '../helpers/self-edit-cache.helper';
import { membersQueryKeys } from '../queries/members.keys';
import { updateMemberProfile } from '../services/update-member-profile.service';
import type { MemberProfile, UpdateProfileInput } from '../types/members.types';

interface UpdateProfileCallbacks {
  readonly onSuccess: () => void;
  readonly onConflict: () => void;
  readonly onError: () => void;
}

interface UpdateProfileContext {
  readonly previous: MemberProfile | undefined;
}

export interface UpdateProfileMutationView {
  readonly submit: (input: UpdateProfileInput) => void;
  readonly isSubmitting: boolean;
}

/**
 * Self profile-edit mutation: optimistic cache patch, rollback on failure, and
 * cache reconciliation. A stale version yields a CONFLICT AppError; the cache is
 * rolled back and the whole team cache invalidated so the latest is reloaded.
 */
export function useUpdateProfileMutation(
  teamId: string,
  membershipId: string,
  callbacks: UpdateProfileCallbacks,
): UpdateProfileMutationView {
  const queryClient = useQueryClient();
  const memberKey = membersQueryKeys.member(teamId, membershipId);
  const mutation = useAppMutation<MemberProfile, UpdateProfileInput, unknown, UpdateProfileContext>(
    {
      mutationFn: (input) => updateMemberProfile(teamId, membershipId, input),
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey: memberKey });
        const previous = queryClient.getQueryData<MemberProfile>(memberKey);
        queryClient.setQueryData<MemberProfile>(memberKey, (current) =>
          patchProfileOptimistically(current, input),
        );
        return { previous };
      },
      onError: (error, _input, context) => {
        queryClient.setQueryData(memberKey, context?.previous);
        if (toAppError(error).code === APP_ERROR_CODE.Conflict) {
          callbacks.onConflict();
        } else {
          callbacks.onError();
        }
      },
      onSuccess: (updated) => {
        queryClient.setQueryData(memberKey, updated);
        callbacks.onSuccess();
      },
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: membersQueryKeys.team(teamId) });
      },
    },
  );
  return {
    submit: (input) => {
      mutation.mutate(input);
    },
    isSubmitting: mutation.isPending,
  };
}
