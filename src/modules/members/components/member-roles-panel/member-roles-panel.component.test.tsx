import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { MEMBER_ROLE } from '../../constants/members.constants';
import { MemberRolesPanel } from './member-roles-panel.component';
import type { MemberRolesPanelProps } from './member-roles-panel.types';

function build(overrides: Partial<MemberRolesPanelProps>): MemberRolesPanelProps {
  return {
    heading: 'Roles',
    description: 'Roles control access',
    ceilingNotice: 'Ceiling applies',
    emptyLabel: 'No roles',
    canManage: true,
    roles: [
      { role: MEMBER_ROLE.coach, label: 'Coach', checked: true, disabled: false },
      { role: MEMBER_ROLE.teamAdmin, label: 'Team admin', checked: false, disabled: true },
    ],
    onToggle: vi.fn(),
    saveLabel: 'Save',
    savingLabel: 'Saving',
    isSaving: false,
    isDirty: true,
    onSave: vi.fn(),
    ...overrides,
  };
}

describe('MemberRolesPanel', () => {
  it('hides for non-managers', () => {
    const { container } = render(<MemberRolesPanel {...build({ canManage: false })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('toggles a role and saves', () => {
    const onToggle = vi.fn();
    const onSave = vi.fn();
    render(<MemberRolesPanel {...build({ onToggle, onSave, ceilingNotice: null })} />);
    const toggles = screen.getAllByTestId(TEST_IDS.memberRoleToggle);
    fireEvent.click(toggles[0]!);
    expect(onToggle).toHaveBeenCalledWith(MEMBER_ROLE.coach);
    expect(toggles[1]).toBeDisabled();
    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalled();
  });

  it('shows the saving label while a save is in flight', () => {
    render(<MemberRolesPanel {...build({ isSaving: true })} />);
    expect(screen.getByText('Saving')).toBeInTheDocument();
  });
});
