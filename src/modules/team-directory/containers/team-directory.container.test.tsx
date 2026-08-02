import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildTeamDirectoryScreenView } from '../../../../tests/factories/team-directory-view.factory';
import { useTeamDirectoryScreen } from '../hooks/use-team-directory-screen.hook';
import { TeamDirectoryContainer } from './team-directory.container';

vi.mock('../hooks/use-team-directory-screen.hook', () => ({ useTeamDirectoryScreen: vi.fn() }));

beforeEach(() => {
  vi.mocked(useTeamDirectoryScreen).mockReturnValue(buildTeamDirectoryScreenView());
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('TeamDirectoryContainer', () => {
  it('renders the team directory page shell', () => {
    render(<TeamDirectoryContainer />);

    expect(screen.getByTestId(TEST_IDS.teamDirectoryPage)).toBeInTheDocument();
  });

  it('feeds the view model into the presentational view', () => {
    render(<TeamDirectoryContainer />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'The people behind Ultimate Natives',
    );
  });
});
