import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppMutation, useAppQuery, useQueryClient } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { normalizeOptionalText } from '../helpers/member-form.helper';
import { membersQueryKeys } from '../queries/members.keys';
import { buildMemberAliasesQueryOptions } from '../queries/member-aliases.query';
import { addMemberAlias } from '../services/add-member-alias.service';
import { removeMemberAlias } from '../services/remove-member-alias.service';
import type { AliasesPanelView } from '../types/members-view.types';

/** Alias panel: add/remove aliases (visible only to alias managers). */
export function useMemberAliases(
  teamId: string,
  membershipId: string,
  canManage: boolean,
): AliasesPanelView {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const { showToast } = useAppToast();
  const [draft, setDraft] = useState('');
  const query = useAppQuery(buildMemberAliasesQueryOptions(teamId, membershipId, canManage));
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: membersQueryKeys.aliases(teamId, membershipId) });
  const addMutation = useAppMutation({
    mutationFn: (alias: string) => addMemberAlias(teamId, membershipId, alias),
    onSuccess: () => {
      void invalidate();
      void showToast({ message: t(I18N_KEYS.members.aliasAddedToast), tone: 'success' });
      setDraft('');
    },
    onError: () => {
      void showToast({ message: t(I18N_KEYS.members.aliasErrorToast), tone: 'danger' });
    },
  });
  const removeMutation = useAppMutation({
    mutationFn: (aliasId: string) => removeMemberAlias(teamId, membershipId, aliasId),
    onSuccess: () => {
      void invalidate();
      void showToast({ message: t(I18N_KEYS.members.aliasRemovedToast), tone: 'success' });
    },
    onError: () => {
      void showToast({ message: t(I18N_KEYS.members.aliasErrorToast), tone: 'danger' });
    },
  });
  return {
    heading: t(I18N_KEYS.members.aliasesHeading),
    canManage,
    emptyLabel: t(I18N_KEYS.members.aliasesEmpty),
    items: (query.data ?? []).map((alias) => ({
      id: alias.id,
      alias: alias.alias,
      removeLabel: t(I18N_KEYS.members.aliasRemove, { alias: alias.alias }),
    })),
    addLabel: t(I18N_KEYS.members.aliasAddLabel),
    addPlaceholder: t(I18N_KEYS.members.aliasAddPlaceholder),
    draft,
    onDraftChange: setDraft,
    addButtonLabel: t(I18N_KEYS.members.aliasAdd),
    isBusy: addMutation.isPending || removeMutation.isPending,
    onAdd: () => {
      const alias = normalizeOptionalText(draft);
      if (alias !== null) {
        addMutation.mutate(alias);
      }
    },
    onRemove: (aliasId) => {
      removeMutation.mutate(aliasId);
    },
  };
}
