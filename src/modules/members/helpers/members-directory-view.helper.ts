import type { TranslateParams } from '@/packages/i18n';
import { type AppError } from '@/shared/errors/app.errors';
import { APP_ERROR_CODE } from '@/shared/errors';
import { I18N_KEYS } from '@/shared/i18n';

import {
  MEMBERS_LIST_HEIGHT_PX,
  MEMBERSHIP_STATUS_FILTER_OPTIONS,
  MEMBERSHIP_STATUS_LABEL_KEYS,
  MEMBERSHIP_STATUS_TONE,
  type MembershipStatus,
} from '../constants/members.constants';
import { buildMembersAsyncCopy } from './members-async-copy.helper';
import { formatJerseyLabel, formatPositionsSummary } from './member-format.helper';
import { collectPositionOptions, filterDirectoryItems } from './members-filter.helper';
import { resolveDirectoryStatus } from './member-status.helper';
import type {
  InviteFormView,
  MemberCardView,
  MembersDirectoryView,
  MembersFilterView,
} from '../types/members-view.types';
import type { MemberDirectoryItem, MemberDirectoryPage } from '../types/members.types';

type Translate = (key: string, params?: TranslateParams) => string;

export interface BuildMembersDirectoryViewParams {
  readonly t: Translate;
  readonly page: MemberDirectoryPage | undefined;
  readonly isLoading: boolean;
  readonly isOffline: boolean;
  readonly error: AppError | null;
  readonly search: string;
  readonly status: MembershipStatus | null;
  readonly position: string | null;
  readonly onSearchChange: (value: string) => void;
  readonly onStatusChange: (value: MembershipStatus | null) => void;
  readonly onPositionChange: (value: string | null) => void;
  readonly onRetry: () => void;
  readonly onSelectMember: (membershipId: string) => void;
  readonly invite: InviteFormView;
}

/** One directory row projected into a fully-translated card. */
export function buildMemberCard(t: Translate, item: MemberDirectoryItem): MemberCardView {
  return {
    membershipId: item.membershipId,
    name: item.displayName,
    nickname: item.nickname,
    avatarLabel: item.displayName,
    statusLabel: t(MEMBERSHIP_STATUS_LABEL_KEYS[item.status]),
    statusTone: MEMBERSHIP_STATUS_TONE[item.status],
    jerseyLabel: formatJerseyLabel(t, item.jerseyNumber),
    positionsSummary: formatPositionsSummary(item.positions),
    ariaLabel: item.displayName,
  };
}

function buildFilterView(
  params: BuildMembersDirectoryViewParams,
  positionOptions: readonly string[],
): MembersFilterView {
  const { t } = params;
  return {
    searchLabel: t(I18N_KEYS.members.searchLabel),
    searchPlaceholder: t(I18N_KEYS.members.searchPlaceholder),
    search: params.search,
    onSearchChange: params.onSearchChange,
    statusLabel: t(I18N_KEYS.members.statusFilterLabel),
    allLabel: t(I18N_KEYS.members.filterAll),
    status: params.status,
    statusOptions: MEMBERSHIP_STATUS_FILTER_OPTIONS.map((value) => ({
      value,
      label: t(MEMBERSHIP_STATUS_LABEL_KEYS[value]),
    })),
    onStatusChange: params.onStatusChange,
    positionLabel: t(I18N_KEYS.members.positionFilterLabel),
    position: params.position,
    positionOptions,
    onPositionChange: params.onPositionChange,
  };
}

/** Assemble the full translated directory view from query + filter state. */
export function buildMembersDirectoryView(
  params: BuildMembersDirectoryViewParams,
): MembersDirectoryView {
  const { t, page, error } = params;
  const allItems = page?.items ?? [];
  const visible = filterDirectoryItems(allItems, {
    search: params.search,
    status: params.status,
    position: params.position,
  });
  return {
    title: t(I18N_KEYS.members.title),
    subtitle: t(I18N_KEYS.members.subtitle),
    rosterLabel: t(I18N_KEYS.members.rosterLabel),
    status: resolveDirectoryStatus({
      hasData: page !== undefined,
      hasItems: allItems.length > 0,
      hasVisibleItems: visible.length > 0,
      isLoading: params.isLoading,
      isForbidden: error?.code === APP_ERROR_CODE.Forbidden,
      hasError: error !== null,
      isOffline: params.isOffline,
    }),
    emptyTitle: t(I18N_KEYS.members.emptyTitle),
    emptyMessage: t(I18N_KEYS.members.emptyMessage),
    noMatchesTitle: t(I18N_KEYS.members.noMatchesTitle),
    noMatchesMessage: t(I18N_KEYS.members.noMatchesMessage),
    forbiddenTitle: t(I18N_KEYS.members.forbiddenTitle),
    forbiddenMessage: t(I18N_KEYS.members.forbiddenMessage),
    countSummary: t(I18N_KEYS.members.countSummary, {
      count: visible.length,
      total: page?.total ?? 0,
    }),
    listHeightPx: MEMBERS_LIST_HEIGHT_PX,
    items: visible.map((item) => buildMemberCard(t, item)),
    onSelectMember: params.onSelectMember,
    filter: buildFilterView(params, collectPositionOptions(allItems)),
    invite: params.invite,
    ...buildMembersAsyncCopy(t, error, params.isOffline, params.onRetry),
  };
}
