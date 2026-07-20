import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { MemberSelfEditForm } from './member-self-edit-form.component';
import type { SelfEditView } from '../../types/members-view.types';

function build(overrides: Partial<SelfEditView>): SelfEditView {
  return {
    canEdit: true,
    openLabel: 'Edit',
    isOpen: false,
    onOpen: vi.fn(),
    onClose: vi.fn(),
    title: 'Edit profile',
    fullNameLabel: 'Full name',
    fullName: 'Omar',
    onFullNameChange: vi.fn(),
    fullNameError: null,
    nicknameLabel: 'Nickname',
    nickname: '',
    onNicknameChange: vi.fn(),
    jerseyLabel: 'Jersey',
    jersey: '',
    onJerseyChange: vi.fn(),
    submitLabel: 'Save',
    submittingLabel: 'Saving',
    cancelLabel: 'Cancel',
    isSubmitting: false,
    onSubmit: vi.fn(),
    ...overrides,
  };
}

describe('MemberSelfEditForm', () => {
  it('hides when self-edit is not allowed', () => {
    const { container } = render(<MemberSelfEditForm selfEdit={build({ canEdit: false })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('opens then submits the edit form', () => {
    const onOpen = vi.fn();
    const onSubmit = vi.fn();
    const { rerender } = render(<MemberSelfEditForm selfEdit={build({ onOpen })} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.memberSelfEditOpen));
    expect(onOpen).toHaveBeenCalled();
    rerender(
      <MemberSelfEditForm
        selfEdit={build({ isOpen: true, fullNameError: 'Required', onSubmit })}
      />,
    );
    expect(screen.getByTestId(TEST_IDS.memberSelfEditForm)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(TEST_IDS.memberSelfEditSubmit));
    expect(onSubmit).toHaveBeenCalled();
  });
});
