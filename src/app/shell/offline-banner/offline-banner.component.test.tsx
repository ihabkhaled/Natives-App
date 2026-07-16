import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OfflineBannerView } from './offline-banner.component';
import { OFFLINE_BANNER_TEST_ID } from './offline-banner.constants';

describe('OfflineBannerView', () => {
  it('renders nothing while hidden', () => {
    const { container } = render(<OfflineBannerView visible={false} message="You are offline" />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId(OFFLINE_BANNER_TEST_ID)).not.toBeInTheDocument();
  });

  it('shows the message when visible', () => {
    render(<OfflineBannerView visible message="You are offline" />);

    expect(screen.getByTestId(OFFLINE_BANNER_TEST_ID)).toHaveTextContent('You are offline');
  });

  it('announces itself politely to assistive technology', () => {
    render(<OfflineBannerView visible message="You are offline" />);

    const banner = screen.getByTestId(OFFLINE_BANNER_TEST_ID);
    expect(banner).toHaveAttribute('role', 'status');
    expect(banner).toHaveAttribute('aria-live', 'polite');
  });
});
