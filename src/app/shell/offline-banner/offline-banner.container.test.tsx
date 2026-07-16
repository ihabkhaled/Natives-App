import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { OfflineBannerContainer } from './offline-banner.container';
import { OFFLINE_BANNER_TEST_ID } from './offline-banner.constants';
import { useOfflineBanner } from './use-offline-banner.hook';

vi.mock('./use-offline-banner.hook', () => ({ useOfflineBanner: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('OfflineBannerContainer', () => {
  it('renders nothing while the connection is up', () => {
    vi.mocked(useOfflineBanner).mockReturnValue({ visible: false, message: 'You are offline' });

    const { container } = render(<OfflineBannerContainer />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the banner with the hook message when the connection drops', () => {
    vi.mocked(useOfflineBanner).mockReturnValue({ visible: true, message: 'You are offline' });

    render(<OfflineBannerContainer />);

    expect(screen.getByTestId(OFFLINE_BANNER_TEST_ID)).toHaveTextContent('You are offline');
  });
});
