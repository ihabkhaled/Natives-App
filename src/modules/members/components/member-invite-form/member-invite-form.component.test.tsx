import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { MemberInviteForm } from './member-invite-form.component';
import type { InviteFormView } from '../../types/members-view.types';

function buildInvite(overrides: Partial<InviteFormView>): InviteFormView {
  return {
    canInvite: true,
    openLabel: 'Invite',
    isOpen: false,
    onOpen: vi.fn(),
    onClose: vi.fn(),
    title: 'Invite a member',
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
});
