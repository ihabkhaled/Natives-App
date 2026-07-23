import { describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import {
  buildMemberCard,
  buildMembersDirectoryView,
  type BuildMembersDirectoryViewParams,
} from './members-directory-view.helper';
import type { InviteFormView } from '../types/members-view.types';
import type { MemberDirectoryItem, MemberDirectoryPage } from '../types/members.types';

const t = (key: string): string => key;
const noop = (): void => undefined;

const invite: InviteFormView = {
  canInvite: false,
  openLabel: 'open',
  isOpen: false,
  onOpen: noop,
  onClose: noop,
  title: 'title',
  intro: 'intro',
  emailLabel: 'email',
  emailPlaceholder: 'ep',
  email: '',
  onEmailChange: noop,
  emailError: null,
  roleLabel: 'role',
  roleHint: 'rh',
  role: 'member',
  roleOptions: [{ value: 'member', label: 'Member' }],
  roleOptionsNotice: null,
  roleSelectDisabled: false,
  onRoleChange: noop,
  profileHeading: 'ph',
  profileIntro: 'pi',
  errorMessage: null,
  sent: null,
  fullNameLabel: 'fn',
  fullNamePlaceholder: 'fnp',
  fullName: '',
  onFullNameChange: noop,
  fullNameError: null,
  nicknameLabel: 'nn',
  nickname: '',
  onNicknameChange: noop,
  jerseyLabel: 'j',
  jersey: '',
  onJerseyChange: noop,
  submitLabel: 's',
  submittingLabel: 'ss',
  cancelLabel: 'c',
  isSubmitting: false,
  onSubmit: noop,
};

const item: MemberDirectoryItem = {
  membershipId: 'a',
  teamId: 't',
  status: 'active',
  displayName: 'Omar',
  nickname: 'O',
  jerseyNumber: 7,
  positions: ['handler'],
  hasAvatar: false,
};

function params(
  overrides: Partial<BuildMembersDirectoryViewParams>,
): BuildMembersDirectoryViewParams {
  return {
    t,
    page: undefined,
    isLoading: false,
    isOffline: false,
    error: null,
    search: '',
    status: null,
    position: null,
    onSearchChange: noop,
    onStatusChange: noop,
    onPositionChange: noop,
    onRetry: noop,
    onSelectMember: noop,
    invite,
    ...overrides,
  };
}

describe('buildMemberCard', () => {
  it('builds a translated card with jersey and positions', () => {
    const card = buildMemberCard(t, item);
    expect(card).toMatchObject({ name: 'Omar', nickname: 'O', jerseyLabel: 'members.jerseyLabel' });
    const bare = buildMemberCard(t, { ...item, nickname: null, jerseyNumber: null, positions: [] });
    expect(bare.jerseyLabel).toBeNull();
    expect(bare.positionsSummary).toBeNull();
  });
});

describe('buildMembersDirectoryView', () => {
  it('is loading with no data', () => {
    expect(buildMembersDirectoryView(params({ isLoading: true })).status).toBe('loading');
  });

  it('is ready with a filtered visible count', () => {
    const page: MemberDirectoryPage = { items: [item], total: 1, pageSize: 20, hasMore: false };
    const view = buildMembersDirectoryView(params({ page }));
    expect(view.status).toBe('ready');
    expect(view.items).toHaveLength(1);
    expect(view.filter.statusOptions.length).toBeGreaterThan(0);
  });

  it('surfaces a forbidden state and translated error message', () => {
    const view = buildMembersDirectoryView(
      params({ error: new AppError({ code: APP_ERROR_CODE.Forbidden }) }),
    );
    expect(view.status).toBe('forbidden');
    expect(view.errorMessage).toBe('errors.forbidden');
  });

  it('wires filter change handlers', () => {
    const onSearchChange = vi.fn();
    const view = buildMembersDirectoryView(params({ onSearchChange }));
    view.filter.onSearchChange('x');
    expect(onSearchChange).toHaveBeenCalledWith('x');
  });
});
