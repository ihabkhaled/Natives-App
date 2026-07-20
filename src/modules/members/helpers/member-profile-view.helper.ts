import type { TranslateParams } from '@/packages/i18n';
import { type AppError } from '@/shared/errors/app.errors';
import { I18N_KEYS } from '@/shared/i18n';

import {
  MEMBER_AUDIENCE,
  MEMBERSHIP_STATUS_LABEL_KEYS,
  MEMBERSHIP_STATUS_TONE,
} from '../constants/members.constants';
import { buildMembersAsyncCopy } from './members-async-copy.helper';
import { buildProfileFields } from './member-profile-fields.helper';
import { resolveProfileStatus } from './member-status.helper';
import type {
  AliasesPanelView,
  HistoryPanelView,
  LifecyclePanelView,
  MemberAvatarView,
  MemberProfileHeaderView,
  MemberProfileView,
  RolesPanelView,
  SelfEditView,
} from '../types/members-view.types';
import type { MemberProfile } from '../types/members.types';

type Translate = (key: string, params?: TranslateParams) => string;

export interface BuildMemberProfileViewParams {
  readonly t: Translate;
  readonly profile: MemberProfile | undefined;
  readonly isLoading: boolean;
  readonly isOffline: boolean;
  readonly error: AppError | null;
  readonly onBack: () => void;
  readonly onRetry: () => void;
  readonly avatar: MemberAvatarView;
  readonly selfEdit: SelfEditView;
  readonly lifecycle: LifecyclePanelView;
  readonly roles: RolesPanelView;
  readonly aliases: AliasesPanelView;
  readonly history: HistoryPanelView;
}

/** True when the audience shape hides some fields from this viewer. */
function isRestrictedAudience(profile: MemberProfile): boolean {
  return profile.audience !== MEMBER_AUDIENCE.admin && profile.audience !== MEMBER_AUDIENCE.self;
}

function buildHeader(
  t: Translate,
  profile: MemberProfile,
  avatar: MemberAvatarView,
): MemberProfileHeaderView {
  return {
    name: profile.displayName,
    nickname: profile.nickname,
    statusLabel: t(MEMBERSHIP_STATUS_LABEL_KEYS[profile.status]),
    statusTone: MEMBERSHIP_STATUS_TONE[profile.status],
    avatar,
  };
}

/** Assemble the full translated profile view from the query + panel views. */
export function buildMemberProfileView(params: BuildMemberProfileViewParams): MemberProfileView {
  const { t, profile, error } = params;
  return {
    title: t(I18N_KEYS.members.profileTitle),
    backLabel: t(I18N_KEYS.members.back),
    onBack: params.onBack,
    status: resolveProfileStatus({
      hasData: profile !== undefined,
      isLoading: params.isLoading,
      errorCode: error?.code ?? null,
      isOffline: params.isOffline,
    }),
    notFoundTitle: t(I18N_KEYS.members.notFoundTitle),
    notFoundMessage: t(I18N_KEYS.members.notFoundMessage),
    forbiddenTitle: t(I18N_KEYS.members.forbiddenTitle),
    forbiddenMessage: t(I18N_KEYS.members.forbiddenMessage),
    header: profile === undefined ? null : buildHeader(t, profile, params.avatar),
    fieldsHeading: t(I18N_KEYS.members.fieldsHeading),
    restrictedNotice:
      profile !== undefined && isRestrictedAudience(profile)
        ? t(I18N_KEYS.members.restrictedNotice)
        : null,
    fields: profile === undefined ? [] : buildProfileFields(t, profile),
    selfEdit: params.selfEdit,
    lifecycle: params.lifecycle,
    roles: params.roles,
    aliases: params.aliases,
    history: params.history,
    ...buildMembersAsyncCopy(t, error, params.isOffline, params.onRetry),
  };
}
