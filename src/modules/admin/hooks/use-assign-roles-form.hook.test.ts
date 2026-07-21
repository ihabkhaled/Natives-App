import { act } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { MEMBER_ROLE, type MemberRole } from '@/modules/members';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useAssignRolesForm } from './use-assign-roles-form.hook';

const SERVER_ROLES: readonly MemberRole[] = [MEMBER_ROLE.member];

function renderForm(membershipId = 'membership-1') {
  return renderHookWithProviders(() => useAssignRolesForm('team-1', membershipId, SERVER_ROLES));
}

beforeAll(async () => {
  await initTestI18n();
});

describe('useAssignRolesForm', () => {
  it('starts from the roles the server reports', () => {
    expect(renderForm().result.current.selected).toEqual(SERVER_ROLES);
  });

  it('adds a role to the draft, leaving the server value untouched', () => {
    const { result } = renderForm();

    act(() => {
      result.current.toggle(MEMBER_ROLE.coach);
    });

    expect(result.current.selected).toEqual([MEMBER_ROLE.member, MEMBER_ROLE.coach]);
  });

  it('removes a role that is already in the draft', () => {
    const { result } = renderForm();

    act(() => {
      result.current.toggle(MEMBER_ROLE.coach);
    });
    act(() => {
      result.current.toggle(MEMBER_ROLE.coach);
    });

    expect(result.current.selected).toEqual([MEMBER_ROLE.member]);
  });

  it('treats a short reason as missing, because the change is audited', () => {
    const { result } = renderForm();

    act(() => {
      result.current.setReason('ok');
    });

    expect(result.current.isReasonValid).toBe(false);
    expect(result.current.canSave).toBe(false);
  });

  it('refuses to save without a reason even when the command is invoked directly', () => {
    const { result } = renderForm();

    act(() => {
      result.current.save();
    });

    expect(result.current.isSaving).toBe(false);
  });

  it('refuses to save before a member is chosen', () => {
    const { result } = renderForm('');

    act(() => {
      result.current.setReason('Promoted after the AGM');
    });
    act(() => {
      result.current.save();
    });

    expect(result.current.canSave).toBe(false);
    expect(result.current.isSaving).toBe(false);
  });

  it('allows the save once a member and a reason are both present', () => {
    const { result } = renderForm();

    act(() => {
      result.current.setReason('Promoted after the AGM');
    });

    expect(result.current.canSave).toBe(true);
  });
});
