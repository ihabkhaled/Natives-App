import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildAssignmentRowView,
  buildRoleAssignmentsScreenView,
} from '../../../../../tests/factories/role-assignments-view.factory';
import { fireIonInput } from '../../../../../tests/setup/ionic-events.helper';
import { RoleAssignmentsView } from './role-assignments-view.component';
import { TARGET_USER_TEST_ID } from './role-assignments-view.constants';

describe('RoleAssignmentsView', () => {
  it('lists every assignment the screen resolved', () => {
    render(
      <RoleAssignmentsView
        {...buildRoleAssignmentsScreenView({
          rows: [
            buildAssignmentRowView(),
            buildAssignmentRowView({ id: 'assignment-2', roleLabel: 'Scorekeeper' }),
          ],
        })}
      />,
    );

    expect(screen.getAllByTestId(TEST_IDS.roleAssignmentsRow)).toHaveLength(2);
    expect(screen.getByText('Assignments')).toBeInTheDocument();
  });

  it('keeps the target field reachable in a non-ready state', () => {
    render(
      <RoleAssignmentsView
        {...buildRoleAssignmentsScreenView({ status: 'empty', rows: [], grant: null })}
      />,
    );

    // The field steers the screen; it is not a result of it.
    expect(screen.getByTestId(TEST_IDS.roleAssignmentsEmpty)).toBeInTheDocument();
    expect(screen.getByText('No assignments yet')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.roleAssignmentsRow)).not.toBeInTheDocument();
  });

  it('reports what the administrator typed as the target', () => {
    const onTargetChange = vi.fn();
    render(<RoleAssignmentsView {...buildRoleAssignmentsScreenView({ onTargetChange })} />);

    fireIonInput(screen.getByTestId(TARGET_USER_TEST_ID), 'user-9');

    expect(onTargetChange).toHaveBeenCalledWith('user-9');
  });

  it('shows a failed command as a status message rather than swallowing it', () => {
    render(
      <RoleAssignmentsView
        {...buildRoleAssignmentsScreenView({ notice: 'That action did not complete. Try again.' })}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('That action did not complete.');
  });

  it('renders no grant panel when the screen withheld one', () => {
    render(<RoleAssignmentsView {...buildRoleAssignmentsScreenView({ grant: null })} />);

    expect(screen.queryByText('Roles you may assign')).not.toBeInTheDocument();
  });

  it('presents the forbidden state to a principal without the grant', () => {
    render(
      <RoleAssignmentsView
        {...buildRoleAssignmentsScreenView({ status: 'forbidden', rows: [], grant: null })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.roleAssignmentsForbidden)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.roleAssignmentsRow)).not.toBeInTheDocument();
  });
});
