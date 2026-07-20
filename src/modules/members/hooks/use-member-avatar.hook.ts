import { useAppTranslation } from '@/packages/i18n';
import { useAppMutation, useAppQuery, useQueryClient } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { membersQueryKeys } from '../queries/members.keys';
import { buildMemberAvatarQueryOptions } from '../queries/member-avatar.query';
import { updateMemberAvatar } from '../services/update-member-avatar.service';
import type { MemberAvatarView } from '../types/members-view.types';
import type { MemberProfile } from '../types/members.types';

/** Avatar display (signed URL) + mock capture/upload mutation. */
export function useMemberAvatar(
  teamId: string,
  membershipId: string,
  profile: MemberProfile | undefined,
  canUpload: boolean,
): MemberAvatarView {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const { showToast } = useAppToast();
  const name = profile?.displayName ?? '';
  const query = useAppQuery(
    buildMemberAvatarQueryOptions(teamId, membershipId, profile?.hasAvatar === true),
  );
  const mutation = useAppMutation({
    mutationFn: () => updateMemberAvatar(teamId, membershipId),
    onSuccess: (updated) => {
      queryClient.setQueryData(membersQueryKeys.member(teamId, membershipId), updated);
      void queryClient.invalidateQueries({
        queryKey: membersQueryKeys.avatar(teamId, membershipId),
      });
      void showToast({ message: t(I18N_KEYS.members.avatarUpdatedToast), tone: 'success' });
    },
    onError: () => {
      void showToast({ message: t(I18N_KEYS.members.avatarErrorToast), tone: 'danger' });
    },
  });
  return {
    label: t(I18N_KEYS.members.avatarLabel),
    imageAlt: t(I18N_KEYS.members.avatarImageAlt, { name }),
    name,
    url: query.data?.url ?? null,
    canUpload,
    uploadLabel: t(I18N_KEYS.members.avatarUpload),
    uploadingLabel: t(I18N_KEYS.members.avatarUploading),
    isUploading: mutation.isPending,
    onUpload: () => {
      mutation.mutate(undefined);
    },
  };
}
