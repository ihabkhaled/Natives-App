import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildRoleAssignmentsScreenView } from '../../../../tests/factories/role-assignments-view.factory';
import { useRoleAssignmentsScreen } from '../hooks/use-role-assignments-screen.hook';
import { RoleAssignmentsContainer } from './role-assignments.container';

vi.mock('../hooks/use-role-assignments-screen.hook', () => ({
  useRoleAssignmentsScreen: vi.fn(),
}));

describe('RoleAssignmentsContainer', () => {
  it('composes the screen hook with the presentational view', () => {
    vi.mocked(useRoleAssignmentsScreen).mockReturnValue(
      buildRoleAssignmentsScreenView({ status: 'empty', rows: [], grant: null }),
    );

    render(<RoleAssignmentsContainer />);

    expect(screen.getByTestId(TEST_IDS.roleAssignmentsView)).toBeInTheDocument();
    expect(screen.getByText('No assignments yet')).toBeInTheDocument();
  });
});
