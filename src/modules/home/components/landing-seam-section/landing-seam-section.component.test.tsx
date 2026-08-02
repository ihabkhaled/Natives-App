import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { LandingSeamChrome } from '../../helpers/landing-seam-copy.helper';
import { LandingSeamSection } from './landing-seam-section.component';
import type { LandingSeamSectionProps } from './landing-seam-section.types';

function chrome(overrides: Partial<LandingSeamChrome> = {}): LandingSeamChrome {
  return {
    status: 'ready',
    loadingLabel: 'Loading…',
    errorTitle: 'Something went wrong',
    errorMessage: 'Try again.',
    retryLabel: 'Retry',
    onRetry: () => {},
    offlineTitle: 'Offline',
    offlineMessage: 'Reconnect to continue.',
    offlineNoticeLabel: 'Reconnect to continue.',
    isOffline: false,
    forbiddenTitle: 'Not allowed',
    forbiddenMessage: 'You lack a permission.',
    emptyTitle: 'Nothing yet',
    emptyMessage: 'Coming soon.',
    ...overrides,
  };
}

function props(overrides: Partial<LandingSeamSectionProps> = {}): LandingSeamSectionProps {
  return {
    heading: 'Leadership & Staff',
    intro: 'The people behind the team.',
    chrome: chrome(),
    sectionTestId: 'landing-staff',
    stateTestIds: {
      loadingTestId: 'landing-staff-loading',
      errorTestId: 'landing-staff-error',
      offlineTestId: 'landing-staff-offline',
      forbiddenTestId: 'landing-staff-forbidden',
      emptyTestId: 'landing-staff-empty',
    },
    children: <div data-testid="ready-content">ready</div>,
    ...overrides,
  };
}

describe('LandingSeamSection', () => {
  it('renders the heading, intro, and children when ready', () => {
    render(<LandingSeamSection {...props()} />);

    expect(screen.getByTestId('landing-staff')).toBeInTheDocument();
    expect(screen.getByText('The people behind the team.')).toBeInTheDocument();
    expect(screen.getByTestId('ready-content')).toBeInTheDocument();
  });

  it('shows the designed empty state and hides children when the seam has no items yet', () => {
    render(<LandingSeamSection {...props({ chrome: chrome({ status: 'empty' }) })} />);

    expect(screen.getByTestId('landing-staff-empty')).toHaveTextContent('Nothing yet');
    expect(screen.queryByTestId('ready-content')).not.toBeInTheDocument();
  });
});
