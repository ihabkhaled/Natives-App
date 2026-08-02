import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { StaffDirectorySectionView } from '../../helpers/landing-team-seam.helper';
import { LandingStaffDirectory } from './landing-staff-directory.component';

function view(overrides: Partial<StaffDirectorySectionView> = {}): StaffDirectorySectionView {
  return {
    heading: 'Leadership & Staff',
    intro: 'The Season Board keeping Ultimate Natives running.',
    chrome: {
      status: 'ready',
      loadingLabel: 'Loading…',
      errorTitle: 'Error',
      errorMessage: 'Error',
      retryLabel: 'Retry',
      onRetry: vi.fn(),
      offlineTitle: 'Offline',
      offlineMessage: 'Offline',
      offlineNoticeLabel: 'Offline',
      isOffline: false,
      forbiddenTitle: 'Forbidden',
      forbiddenMessage: 'Forbidden',
      emptyTitle: 'No staff yet',
      emptyMessage: 'No staff yet',
    },
    members: [
      {
        id: 'sherif-ashraf',
        name: 'Sherif Ashraf',
        nickname: '3alamy',
        titles: ['Coach'],
        avatarLabel: 'Sherif Ashraf avatar',
        photoUrl: null,
      },
      {
        id: 'ihab-khaled',
        name: 'Ihab Khaled',
        nickname: 'Hobz',
        titles: ['Analysis', 'Technical', 'Co-Coach'],
        avatarLabel: 'Ihab Khaled avatar',
        photoUrl: null,
      },
    ],
    ...overrides,
  };
}

describe('LandingStaffDirectory', () => {
  it('paints a supplied portrait over the initials, and omits it when there is none', () => {
    render(
      <LandingStaffDirectory
        view={view({
          members: [
            {
              id: 'sherif-ashraf',
              name: 'Sherif Ashraf',
              nickname: '3alamy',
              titles: ['Coach'],
              avatarLabel: 'Sherif Ashraf avatar',
              photoUrl: '/staff/sherif-ashraf.jpg',
            },
            {
              id: 'ihab-khaled',
              name: 'Ihab Khaled',
              nickname: 'Hobz',
              titles: ['Analysis'],
              avatarLabel: 'Ihab Khaled avatar',
              photoUrl: null,
            },
          ],
        })}
      />,
    );

    // The portrait is a background layer, not an <img>, so a file that has not
    // been supplied yet simply does not paint and the initials show through
    // rather than leaving a broken-image icon on a public page.
    expect(screen.getByTestId('landing-staff-card-sherif-ashraf-photo')).toHaveStyle({
      backgroundImage: 'url("/staff/sherif-ashraf.jpg")',
    });
    expect(screen.queryByTestId('landing-staff-card-ihab-khaled-photo')).not.toBeInTheDocument();
  });

  it('renders every staff member with their name, nickname, and titles', () => {
    render(<LandingStaffDirectory view={view()} />);

    const first = screen.getByTestId('landing-staff-card-sherif-ashraf');
    expect(first).toHaveTextContent('Sherif Ashraf');
    expect(first).toHaveTextContent('3alamy');
    expect(first).toHaveTextContent('Coach');

    const second = screen.getByTestId('landing-staff-card-ihab-khaled');
    expect(second).toHaveTextContent('Analysis');
    expect(second).toHaveTextContent('Technical');
    expect(second).toHaveTextContent('Co-Coach');
  });

  it('shows the empty state instead of the grid when the seam has no members', () => {
    const emptyChrome = { ...view().chrome, status: 'empty' as const };
    render(<LandingStaffDirectory view={view({ members: [], chrome: emptyChrome })} />);

    expect(screen.getByTestId('landing-staff-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('landing-staff-card-sherif-ashraf')).not.toBeInTheDocument();
  });
});
