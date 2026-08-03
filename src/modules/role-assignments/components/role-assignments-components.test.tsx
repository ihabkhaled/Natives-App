import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildAssignmentRowView,
  buildGrantPanelView,
} from '../../../../tests/factories/role-assignments-view.factory';
import { fireIonChange } from '../../../../tests/setup/ionic-events.helper';
import { AssignmentRow } from './assignment-row';
import { GRANT_PANEL_TEST_IDS } from './grant-role-panel/grant-role-panel.constants';
import { GrantRolePanel } from './grant-role-panel';

describe('AssignmentRow', () => {
  it('shows the role next to the scope it applies in', () => {
    render(<AssignmentRow view={buildAssignmentRowView()} />);

    // "Coach" means nothing until you know where. The chip renders its label
    // twice (screen-reader copy plus an aria-hidden visual), hence getAllBy.
    expect(screen.getAllByText('Coach')).not.toHaveLength(0);
    expect(screen.getByText('team-1')).toBeInTheDocument();
  });

  it('states when the grant started and who made it', () => {
    render(<AssignmentRow view={buildAssignmentRowView()} />);

    expect(screen.getByText('Since 1 Jul 2026 · Granted by admin-1')).toBeInTheDocument();
  });

  it('omits the revoke affordance entirely when it may not be used', () => {
    render(
      <AssignmentRow
        view={buildAssignmentRowView({
          id: 'platform-1',
          canRevoke: false,
          scopeLabel: 'Platform',
        })}
      />,
    );

    // Absent, not disabled: a platform grant ends through the audited flow.
    expect(screen.queryByText('Revoke')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${TEST_IDS.roleAssignmentsAction}-platform-1`),
    ).not.toBeInTheDocument();
  });

  it('reports the revoke to its caller', () => {
    const view = buildAssignmentRowView({ onRevoke: vi.fn() });
    render(<AssignmentRow view={view} />);

    fireEvent.click(screen.getByTestId(`${TEST_IDS.roleAssignmentsAction}-assignment-1`));

    expect(view.onRevoke).toHaveBeenCalledOnce();
  });
});

describe('GrantRolePanel', () => {
  it('states the privilege ceiling before anything is chosen', () => {
    render(<GrantRolePanel view={buildGrantPanelView()} />);

    expect(
      screen.getByText('Only roles inside your own privilege ceiling are listed.'),
    ).toBeInTheDocument();
  });

  it('offers only the roles it was given', () => {
    render(<GrantRolePanel view={buildGrantPanelView()} />);

    expect(screen.getByText('Member')).toBeInTheDocument();
    expect(screen.getByText('Coach')).toBeInTheDocument();
  });

  it('says plainly when there is nothing to pass on, and locks the select', () => {
    render(
      <GrantRolePanel
        view={buildGrantPanelView({
          options: [],
          emptyCatalogMessage: 'You hold no role you can pass on here.',
          canSubmit: false,
        })}
      />,
    );

    expect(screen.getByText('You hold no role you can pass on here.')).toBeInTheDocument();
    // Ionic reflects disabled as a property on the custom element; the native
    // :disabled pseudo-state never applies, so jest-dom's toBeDisabled cannot.
    expect(screen.getByTestId(GRANT_PANEL_TEST_IDS.role)).toHaveProperty('disabled', true);
  });

  it('reports the chosen role and the submission to its caller', () => {
    const view = buildGrantPanelView({ onRoleChange: vi.fn(), onSubmit: vi.fn() });
    render(<GrantRolePanel view={view} />);

    fireIonChange(screen.getByTestId(GRANT_PANEL_TEST_IDS.role), 'member');
    fireEvent.click(screen.getByTestId(GRANT_PANEL_TEST_IDS.submit));

    expect(view.onRoleChange).toHaveBeenCalledWith('member');
    expect(view.onSubmit).toHaveBeenCalledOnce();
  });
});
