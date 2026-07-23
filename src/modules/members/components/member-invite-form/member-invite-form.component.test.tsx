import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { MemberInviteForm } from './member-invite-form.component';
import type { InviteFormView, InviteSentView } from '../../types/members-view.types';

function buildSent(overrides: Partial<InviteSentView> = {}): InviteSentView {
  return {
    title: 'Invitation sent',
    message: 'We emailed the invitation to omar@example.com.',
    linkLabel: 'Accept link',
    linkHint: 'Share this link only if the email does not arrive.',
    acceptUrl: 'https://app.example.com/accept-invitation?token=abc',
    copyLabel: 'Copy link',
    onCopy: vi.fn(),
    roleLabel: 'Role on acceptance',
    roleValue: 'Coach',
    teamLabel: 'Team',
    teamValue: 'Cairo Natives',
    expiresLabel: 'Expires',
    expiresValue: '28 July 2026 3:38 PM',
    doneLabel: 'Done',
    onDone: vi.fn(),
    ...overrides,
  };
}

function buildInvite(overrides: Partial<InviteFormView>): InviteFormView {
  return {
    canInvite: true,
    openLabel: 'Invite',
    isOpen: false,
    onOpen: vi.fn(),
    onClose: vi.fn(),
    title: 'Invite a member',
    intro: 'Send an account invitation by email.',
    emailLabel: 'Email address',
    emailPlaceholder: 'name@example.com',
    email: '',
    onEmailChange: vi.fn(),
    emailError: null,
    roleLabel: 'Team role',
    roleHint: 'Reads their own data and team boards.',
    role: 'member',
    roleOptions: [
      { value: 'member', label: 'Member' },
      { value: 'coach', label: 'Coach' },
    ],
    roleOptionsNotice: null,
    roleSelectDisabled: false,
    onRoleChange: vi.fn(),
    profileHeading: 'Roster profile',
    profileIntro: 'How this person appears in the directory.',
    fullNameLabel: 'Full name',
    fullNamePlaceholder: 'name',
    fullName: '',
    onFullNameChange: vi.fn(),
    fullNameError: null,
    nicknameLabel: 'Nickname',
    nickname: '',
    onNicknameChange: vi.fn(),
    jerseyLabel: 'Jersey',
    jersey: '',
    onJerseyChange: vi.fn(),
    submitLabel: 'Send',
    submittingLabel: 'Sending',
    cancelLabel: 'Cancel',
    isSubmitting: false,
    errorMessage: null,
    sent: null,
    onSubmit: vi.fn(),
    ...overrides,
  };
}

describe('MemberInviteForm', () => {
  it('renders nothing without the invite permission', () => {
    const { container } = render(<MemberInviteForm invite={buildInvite({ canInvite: false })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('opens the form and submits', () => {
    const onOpen = vi.fn();
    render(<MemberInviteForm invite={buildInvite({ onOpen })} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.membersInviteButton));
    expect(onOpen).toHaveBeenCalled();
  });

  it('collects the account invitation and the roster profile in one form', () => {
    render(<MemberInviteForm invite={buildInvite({ isOpen: true })} />);

    expect(screen.getByTestId(TEST_IDS.memberInviteEmail)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.memberInviteRole)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.memberInviteFullName)).toBeInTheDocument();
    expect(screen.getByText('Roster profile')).toBeInTheDocument();
  });

  it('shows the open form with an error and wires submit/cancel', () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(
      <MemberInviteForm
        invite={buildInvite({ isOpen: true, fullNameError: 'Required', onSubmit, onClose })}
      />,
    );
    expect(screen.getByTestId(TEST_IDS.memberInviteForm)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(TEST_IDS.memberInviteSubmit));
    expect(onSubmit).toHaveBeenCalled();
    fireEvent.click(screen.getByTestId(TEST_IDS.memberInviteCancel));
    expect(onClose).toHaveBeenCalled();
  });

  it('states a refused invitation as an alert instead of failing silently', () => {
    render(
      <MemberInviteForm
        invite={buildInvite({
          isOpen: true,
          errorMessage: 'That email already has an account or a pending invitation.',
        })}
      />,
    );

    const error = screen.getByTestId(TEST_IDS.memberInviteError);
    expect(error).toHaveAttribute('role', 'alert');
    expect(error).toHaveTextContent('already has an account');
  });

  it('disables the role select and explains while the catalog is unavailable', () => {
    render(
      <MemberInviteForm
        invite={buildInvite({
          isOpen: true,
          roleOptionsNotice: 'Loading the roles you can grant…',
          roleSelectDisabled: true,
          roleOptions: [],
        })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.memberInviteRoleNotice)).toHaveTextContent(
      'Loading the roles you can grant…',
    );
    // Ionic reflects disabled as a property on the custom element; the native
    // :disabled pseudo-state never applies, so jest-dom's toBeDisabled cannot.
    expect(screen.getByTestId(TEST_IDS.memberInviteRole)).toHaveProperty('disabled', true);
  });

  it('states the team and the granted role back on the receipt', () => {
    render(<MemberInviteForm invite={buildInvite({ isOpen: true, sent: buildSent() })} />);

    expect(screen.getByTestId(TEST_IDS.memberInviteSentTeam)).toHaveTextContent('Cairo Natives');
    expect(screen.getByTestId(TEST_IDS.memberInviteSentRole)).toHaveTextContent('Coach');
  });

  it('replaces the form with the sent panel once the invitation exists', () => {
    const onCopy = vi.fn();
    render(
      <MemberInviteForm invite={buildInvite({ isOpen: true, sent: buildSent({ onCopy }) })} />,
    );

    expect(screen.queryByTestId(TEST_IDS.memberInviteForm)).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.memberInviteSent)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.memberInviteLink)).toHaveTextContent(
      'https://app.example.com/accept-invitation?token=abc',
    );

    fireEvent.click(screen.getByTestId(TEST_IDS.memberInviteCopyLink));
    expect(onCopy).toHaveBeenCalledTimes(1);
  });
});
