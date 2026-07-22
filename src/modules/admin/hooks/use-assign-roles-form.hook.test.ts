import { act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type * as MembersModule from '@/modules/members';
import { assignMemberRoles, MEMBER_ROLE, type MemberRole } from '@/modules/members';
import type * as SharedUiModule from '@/shared/ui';
import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { setupToastHarness } from '../../../../tests/setup/toast-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useAssignRolesForm } from './use-assign-roles-form.hook';

vi.mock('@/modules/members', async (importOriginal) => ({
  ...(await importOriginal<typeof MembersModule>()),
  assignMemberRoles: vi.fn(),
}));
vi.mock('@/shared/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof SharedUiModule>()),
  useAppToast: vi.fn(),
}));

const SERVER_ROLES: readonly MemberRole[] = [MEMBER_ROLE.member];

const toast = setupToastHarness();

function renderForm(membershipId = 'membership-1') {
  return renderHookWithProviders(() => useAssignRolesForm('team-1', membershipId, SERVER_ROLES));
}

function conflictError(messageKey: string): AppError {
  return new AppError({ code: APP_ERROR_CODE.Conflict, messageKey });
}

/** Draft a coach promotion with an audited reason and commit it. */
function draftAndSave(result: { current: ReturnType<typeof useAssignRolesForm> }): void {
  act(() => {
    result.current.toggle(MEMBER_ROLE.coach);
  });
  act(() => {
    result.current.setReason('Promoted after the AGM');
  });
  act(() => {
    result.current.save();
  });
}

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

  it('rolls the panel back to the server roles when the save is refused', async () => {
    vi.mocked(assignMemberRoles).mockRejectedValue(conflictError('errors.members.accountRequired'));
    const { result } = renderForm();

    draftAndSave(result);

    await waitFor(() => {
      expect(result.current.selected).toEqual(SERVER_ROLES);
    });
    expect(result.current.isSaving).toBe(false);
  });

  it('states the specific 409 accountRequired refusal, never a generic failure', async () => {
    vi.mocked(assignMemberRoles).mockRejectedValue(conflictError('errors.members.accountRequired'));
    const { result } = renderForm();

    draftAndSave(result);

    await waitFor(() => {
      expect(toast.showToast).toHaveBeenCalledWith({
        message:
          "This member hasn't joined with an account yet, so roles can't be assigned. Invite them by email first.",
        tone: 'danger',
      });
    });
  });

  it('states an escalation refusal in privilege terms', async () => {
    vi.mocked(assignMemberRoles).mockRejectedValue(conflictError('errors.rbac.escalationDenied'));
    const { result } = renderForm();

    draftAndSave(result);

    await waitFor(() => {
      expect(toast.showToast).toHaveBeenCalledWith({
        message: 'You can only assign or remove roles that stay within your own privilege level.',
        tone: 'danger',
      });
    });
  });

  it('clears the draft and confirms once the server accepts the change', async () => {
    vi.mocked(assignMemberRoles).mockResolvedValue({
      membershipId: 'membership-1',
      roles: [MEMBER_ROLE.member, MEMBER_ROLE.coach],
      assignableRoles: [MEMBER_ROLE.member, MEMBER_ROLE.coach],
    });
    const { result } = renderForm();

    draftAndSave(result);

    await waitFor(() => {
      expect(toast.showToast).toHaveBeenCalledWith({
        message: 'Roles updated.',
        tone: 'success',
      });
    });
    expect(result.current.reason).toBe('');
  });
});
