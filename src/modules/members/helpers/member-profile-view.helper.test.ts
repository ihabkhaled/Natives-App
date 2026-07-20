import { describe, expect, it } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import {
  buildMemberProfileView,
  type BuildMemberProfileViewParams,
} from './member-profile-view.helper';
import type {
  AliasesPanelView,
  HistoryPanelView,
  LifecyclePanelView,
  MemberAvatarView,
  RolesPanelView,
  SelfEditView,
} from '../types/members-view.types';
import type { MemberProfile } from '../types/members.types';

const t = (key: string): string => key;
const noop = (): void => undefined;

const avatar: MemberAvatarView = {
  label: 'a',
  imageAlt: 'alt',
  name: 'Omar',
  url: null,
  canUpload: false,
  uploadLabel: 'u',
  uploadingLabel: 'uu',
  isUploading: false,
  onUpload: noop,
};

const selfEdit = { canEdit: false } as SelfEditView;
const lifecycle = { heading: 'l', canManage: false, actions: [] } as unknown as LifecyclePanelView;
const roles = { heading: 'r', canManage: false, roles: [] } as unknown as RolesPanelView;
const aliases = { heading: 'al', canManage: false, items: [] } as unknown as AliasesPanelView;
const history = { heading: 'h', canView: false, items: [] } as unknown as HistoryPanelView;

const profile: MemberProfile = {
  membershipId: 'm',
  teamId: 't',
  audience: 'admin',
  status: 'active',
  displayName: 'Omar',
  nickname: 'O',
  positions: [],
  jerseyNumber: null,
  division: null,
  hasAvatar: false,
  preferredName: null,
  fullNameAr: null,
  gender: null,
  fullName: 'Omar',
  jerseySize: null,
  email: null,
  phone: null,
  heightCm: null,
  weightKg: null,
  ageClassification: null,
  dateOfBirth: null,
  statusReason: null,
  version: 1,
};

function params(overrides: Partial<BuildMemberProfileViewParams>): BuildMemberProfileViewParams {
  return {
    t,
    profile: undefined,
    isLoading: false,
    isOffline: false,
    error: null,
    onBack: noop,
    onRetry: noop,
    avatar,
    selfEdit,
    lifecycle,
    roles,
    aliases,
    history,
    ...overrides,
  };
}

describe('buildMemberProfileView', () => {
  it('is ready with a header and no restricted notice for admin', () => {
    const view = buildMemberProfileView(params({ profile }));
    expect(view.status).toBe('ready');
    expect(view.header?.name).toBe('Omar');
    expect(view.restrictedNotice).toBeNull();
  });

  it('shows a restricted notice for a teammate audience', () => {
    const view = buildMemberProfileView(params({ profile: { ...profile, audience: 'teammate' } }));
    expect(view.restrictedNotice).toBe('members.restrictedNotice');
  });

  it('is loading with no profile and empty fields', () => {
    const view = buildMemberProfileView(params({ isLoading: true }));
    expect(view.status).toBe('loading');
    expect(view.header).toBeNull();
    expect(view.fields).toEqual([]);
  });

  it('resolves forbidden, not-found, offline, and error states', () => {
    expect(
      buildMemberProfileView(params({ error: new AppError({ code: APP_ERROR_CODE.Forbidden }) }))
        .status,
    ).toBe('forbidden');
    expect(
      buildMemberProfileView(params({ error: new AppError({ code: APP_ERROR_CODE.NotFound }) }))
        .status,
    ).toBe('notFound');
    expect(buildMemberProfileView(params({ isOffline: true })).status).toBe('offline');
    const errored = buildMemberProfileView(
      params({ error: new AppError({ code: APP_ERROR_CODE.Server }) }),
    );
    expect(errored.status).toBe('error');
    expect(errored.errorMessage).toBe('errors.server');
  });
});
