import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { usePermissionsMatrix } from '../hooks/use-permissions-matrix.hook';
import { useSeasonsWorkspace } from '../hooks/use-seasons-workspace.hook';
import { useTeamsWorkspace } from '../hooks/use-teams-workspace.hook';
import { PermissionsMatrixContainer } from './permissions-matrix.container';
import { SeasonsContainer } from './seasons.container';
import { TeamsContainer } from './teams.container';

vi.mock('../hooks/use-teams-workspace.hook', () => ({ useTeamsWorkspace: vi.fn() }));
vi.mock('../hooks/use-seasons-workspace.hook', () => ({ useSeasonsWorkspace: vi.fn() }));
vi.mock('../hooks/use-permissions-matrix.hook', () => ({ usePermissionsMatrix: vi.fn() }));

const COPY = {
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
  status: 'empty' as const,
  notice: null,
  title: 'Screen',
  subtitle: 'Subtitle',
};

describe('teams containers', () => {
  it('wires the teams hook to its screen', () => {
    vi.mocked(useTeamsWorkspace).mockReturnValue({
      ...COPY,
      listHeading: 'All teams',
      listIntro: 'Intro',
      rows: [],
      canManage: false,
      canCreate: false,
      openCreateLabel: 'New team',
      onOpenCreate: vi.fn(),
      editor: null,
    });

    render(<TeamsContainer />);

    expect(screen.getByTestId(TEST_IDS.teamsPage)).toBeInTheDocument();
  });

  it('wires the seasons hook to its screen', () => {
    vi.mocked(useSeasonsWorkspace).mockReturnValue({
      ...COPY,
      listHeading: 'Seasons',
      listIntro: 'Intro',
      rows: [],
      canManage: false,
      openCreateLabel: 'New season',
      onOpenCreate: vi.fn(),
      editor: null,
    });

    render(<SeasonsContainer />);

    expect(screen.getByTestId(TEST_IDS.seasonsPage)).toBeInTheDocument();
  });

  it('wires the permissions-matrix hook to its screen', () => {
    vi.mocked(usePermissionsMatrix).mockReturnValue({
      ...COPY,
      notice: 'Read-only.',
      policyVersionLabel: 'Policy version: 5',
      permissionColumnLabel: 'Permission',
      countSummary: '0 permissions',
      areaLabel: 'Area',
      area: 'all',
      areaOptions: [{ value: 'all', label: 'All areas' }],
      onAreaChange: vi.fn(),
      systemRoleLabel: 'System role',
      columns: [],
      rows: [],
    });

    render(<PermissionsMatrixContainer />);

    expect(screen.getByTestId(TEST_IDS.permissionsMatrixPage)).toBeInTheDocument();
  });
});
