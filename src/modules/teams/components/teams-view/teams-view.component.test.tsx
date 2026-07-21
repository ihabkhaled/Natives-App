import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { AdminRecordList } from '../admin-record-list';
import { PermissionsMatrixView } from '../permissions-matrix-view';
import { SeasonEditorForm } from '../season-editor-form';
import { SeasonsView } from '../seasons-view';
import { TeamEditorForm } from '../team-editor-form';
import { TeamsView } from './teams-view.component';
import type {
  AdminFieldView,
  PermissionsMatrixView as PermissionsMatrixViewModel,
  SeasonEditorView,
  SeasonsWorkspaceView,
  TeamEditorView,
  TeamsWorkspaceView,
} from '../../types/teams-view.types';

const SCREEN_COPY = {
  loadingLabel: 'Loading…',
  errorTitle: 'Error',
  errorMessage: 'Failed',
  retryLabel: 'Retry',
  onRetry: vi.fn(),
  offlineTitle: 'Offline',
  offlineMessage: 'Reconnect',
  offlineNoticeLabel: 'Offline',
  isOffline: false,
  forbiddenTitle: 'No access',
  forbiddenMessage: 'Not granted',
  emptyTitle: 'Nothing yet',
  emptyMessage: 'Create the first one',
};

function field(label: string, overrides: Partial<AdminFieldView> = {}): AdminFieldView {
  return {
    label,
    value: '',
    onChange: vi.fn(),
    error: null,
    hint: null,
    isReadOnly: false,
    ...overrides,
  };
}

function row(key: string, canManage = true) {
  return {
    key,
    label: `Team ${key}`,
    value: 'Active',
    detail: `${key} · Africa/Cairo`,
    tone: 'success',
    canManage,
    editLabel: 'Edit',
    onEdit: vi.fn(),
    transitions: [{ key: 'archive', label: 'Archive', onSelect: vi.fn() }],
  };
}

function teamsView(overrides: Partial<TeamsWorkspaceView> = {}): TeamsWorkspaceView {
  return {
    ...SCREEN_COPY,
    title: 'Teams',
    subtitle: 'Every team',
    status: 'ready',
    notice: null,
    listHeading: 'All teams',
    listIntro: 'Slug and timezone',
    rows: [row('team-1')],
    canManage: true,
    canCreate: true,
    openCreateLabel: 'New team',
    onOpenCreate: vi.fn(),
    editor: null,
    ...overrides,
  };
}

function seasonsView(overrides: Partial<SeasonsWorkspaceView> = {}): SeasonsWorkspaceView {
  return {
    ...SCREEN_COPY,
    title: 'Seasons',
    subtitle: 'Competitive windows',
    status: 'ready',
    notice: null,
    listHeading: 'Seasons',
    listIntro: 'Windows and lifecycle',
    rows: [row('season-1')],
    canManage: true,
    openCreateLabel: 'New season',
    onOpenCreate: vi.fn(),
    editor: null,
    ...overrides,
  };
}

function teamEditor(overrides: Partial<TeamEditorView> = {}): TeamEditorView {
  return {
    isOpen: true,
    heading: 'Create a team',
    intro: 'The slug is permanent',
    slug: field('Slug', { hint: 'Lowercase only' }),
    name: field('Name'),
    timezone: field('Timezone'),
    locale: field('Locale'),
    color: field('Colour'),
    submitLabel: 'Create team',
    cancelLabel: 'Cancel',
    isSaving: false,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
}

function seasonEditor(overrides: Partial<SeasonEditorView> = {}): SeasonEditorView {
  const dateField = {
    label: 'Starts on',
    value: '',
    displayValue: '',
    isOpen: false,
    onOpen: vi.fn(),
    onDismiss: vi.fn(),
    onChange: vi.fn(),
    error: null,
  };
  return {
    isOpen: true,
    datePlaceholder: 'Select a date',
    dateOpenLabel: 'Open the date picker',
    dateDialogTitle: 'Choose a date',
    dateCloseLabel: 'Done',
    heading: 'Create a season',
    intro: 'A draft season is invisible',
    slug: field('Slug', { hint: 'Short and stable' }),
    name: field('Name'),
    startsOn: dateField,
    endsOn: { ...dateField, label: 'Ends on' },
    statusLabel: 'Lifecycle',
    statusHint: 'Draft while you prepare it',
    statusValue: 'draft',
    statusOptions: [{ value: 'draft', label: 'Draft' }],
    onStatusChange: vi.fn(),
    submitLabel: 'Create season',
    cancelLabel: 'Cancel',
    isSaving: false,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
}

function matrixView(
  overrides: Partial<PermissionsMatrixViewModel> = {},
): PermissionsMatrixViewModel {
  return {
    ...SCREEN_COPY,
    title: 'Permissions matrix',
    subtitle: 'What each bundle grants',
    status: 'ready',
    notice: 'Read-only.',
    policyVersionLabel: 'Policy version: 5',
    permissionColumnLabel: 'Permission',
    countSummary: '2 permissions',
    areaLabel: 'Area',
    area: 'all',
    areaOptions: [{ value: 'all', label: 'All areas' }],
    onAreaChange: vi.fn(),
    systemRoleLabel: 'System role',
    columns: [{ key: 'MEMBER', label: 'Member', isSystem: true }],
    rows: [
      {
        key: 'practice.read',
        permission: 'practice.read',
        area: 'practices',
        description: 'View practices',
        cells: [{ roleKey: 'MEMBER', isGranted: true, label: 'Granted' }],
      },
    ],
    ...overrides,
  };
}

describe('TeamsView', () => {
  it('lists the teams and offers the create control', () => {
    render(<TeamsView view={teamsView()} />);

    expect(screen.getByTestId(TEST_IDS.teamsView)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.teamsCreateButton)).toBeInTheDocument();
    expect(screen.getByText('Team team-1')).toBeInTheDocument();
  });

  it('hides the create control from a principal who may not create teams', () => {
    render(<TeamsView view={teamsView({ canCreate: false, notice: 'Platform capability' })} />);

    expect(screen.queryByTestId(TEST_IDS.teamsCreateButton)).not.toBeInTheDocument();
    expect(screen.getByText('Platform capability')).toBeInTheDocument();
  });

  it('shows the forbidden state instead of the list', () => {
    render(<TeamsView view={teamsView({ status: 'forbidden' })} />);

    expect(screen.getByText('No access')).toBeInTheDocument();
    expect(screen.queryByText('Team team-1')).not.toBeInTheDocument();
  });

  it('renders the editor when one is open', () => {
    render(<TeamsView view={teamsView({ editor: teamEditor() })} />);

    expect(screen.getByTestId(TEST_IDS.teamEditorForm)).toBeInTheDocument();
  });
});

describe('SeasonsView', () => {
  it('lists the seasons and offers the create control to a manager', () => {
    render(<SeasonsView view={seasonsView()} />);

    expect(screen.getByTestId(TEST_IDS.seasonsView)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.seasonsCreateButton)).toBeInTheDocument();
  });

  it('hides the create control from a reader', () => {
    render(<SeasonsView view={seasonsView({ canManage: false })} />);

    expect(screen.queryByTestId(TEST_IDS.seasonsCreateButton)).not.toBeInTheDocument();
  });

  it('renders the season editor when one is open', () => {
    render(<SeasonsView view={seasonsView({ editor: seasonEditor() })} />);

    expect(screen.getByTestId(TEST_IDS.seasonEditorForm)).toBeInTheDocument();
  });
});

describe('AdminRecordList', () => {
  it('offers edit and every legal transition on a manageable row', async () => {
    const first = row('team-1');
    render(<AdminRecordList rows={[first]} ariaLabel="Teams" rowTestId="teams-row" />);

    await userEvent.click(screen.getByTestId('teams-row-edit-team-1'));
    await userEvent.click(screen.getByTestId('teams-row-archive-team-1'));

    expect(first.onEdit).toHaveBeenCalledTimes(1);
    expect(first.transitions[0]?.onSelect).toHaveBeenCalledTimes(1);
  });

  it('renders no controls at all for a reader', () => {
    render(
      <AdminRecordList rows={[row('team-1', false)]} ariaLabel="Teams" rowTestId="teams-row" />,
    );

    expect(screen.queryByTestId('teams-row-edit-team-1')).not.toBeInTheDocument();
  });

  it('omits the chip and the detail line when a row has neither', () => {
    render(
      <AdminRecordList
        rows={[{ ...row('team-1'), tone: null, detail: null }]}
        ariaLabel="Teams"
        rowTestId="teams-row"
      />,
    );

    expect(screen.queryByText('team-1 · Africa/Cairo')).not.toBeInTheDocument();
  });
});

describe('TeamEditorForm', () => {
  it('renders every field and both actions', async () => {
    const view = teamEditor();
    render(<TeamEditorForm view={view} />);

    expect(screen.getByTestId(TEST_IDS.teamEditorSlug)).toBeInTheDocument();
    expect(screen.getByText('Lowercase only')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId(TEST_IDS.teamEditorSubmit));
    await userEvent.click(screen.getByTestId(TEST_IDS.teamEditorCancel));
    expect(view.onSubmit).toHaveBeenCalledTimes(1);
    expect(view.onCancel).toHaveBeenCalledTimes(1);
  });

  it('omits the hint when there is none', () => {
    render(<TeamEditorForm view={teamEditor({ slug: field('Slug') })} />);

    expect(screen.queryByText('Lowercase only')).not.toBeInTheDocument();
  });
});

describe('SeasonEditorForm', () => {
  it('renders both dates through the design system picker', async () => {
    const view = seasonEditor();
    render(<SeasonEditorForm view={view} />);

    expect(screen.getByTestId(TEST_IDS.seasonEditorStartsOn)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.seasonEditorEndsOn)).toBeInTheDocument();
    expect(screen.getAllByText('Select a date')).toHaveLength(2);

    await userEvent.click(screen.getByTestId(TEST_IDS.seasonEditorSubmit));
    expect(view.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('omits the slug hint when there is none', () => {
    render(<SeasonEditorForm view={seasonEditor({ slug: field('Slug') })} />);

    expect(screen.queryByText('Short and stable')).not.toBeInTheDocument();
  });
});

describe('PermissionsMatrixView', () => {
  it('renders one column per bundle and one row per permission', () => {
    render(<PermissionsMatrixView view={matrixView()} />);

    expect(screen.getByTestId(TEST_IDS.permissionsMatrixTable)).toBeInTheDocument();
    expect(screen.getByText('Member')).toBeInTheDocument();
    expect(screen.getByText('practice.read')).toBeInTheDocument();
    expect(screen.getByText('System role')).toBeInTheDocument();
  });

  it('states each cell meaning for assistive tech, never a tick alone', () => {
    render(<PermissionsMatrixView view={matrixView()} />);

    expect(screen.getByText('Granted')).toBeInTheDocument();
  });

  it('marks a permission the bundle does not grant', () => {
    render(
      <PermissionsMatrixView
        view={matrixView({
          rows: [
            {
              key: 'member.list',
              permission: 'member.list',
              area: 'members',
              description: 'List members',
              cells: [{ roleKey: 'MEMBER', isGranted: false, label: 'Not granted' }],
            },
          ],
        })}
      />,
    );

    expect(screen.getByText('Not granted')).toBeInTheDocument();
  });

  it('omits the system-role note for a bundle that is not one', () => {
    render(
      <PermissionsMatrixView
        view={matrixView({ columns: [{ key: 'CUSTOM', label: 'Custom', isSystem: false }] })}
      />,
    );

    expect(screen.queryByText('System role')).not.toBeInTheDocument();
  });
});
