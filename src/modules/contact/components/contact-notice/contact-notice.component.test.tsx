import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { CONTACT_NOTICE_TONE } from '../../contact.constants';
import type { ContactNoticeView } from '../../types/contact.types';
import { ContactNotice } from './contact-notice.component';

function notice(overrides: Partial<ContactNoticeView> = {}): ContactNoticeView {
  return {
    tone: CONTACT_NOTICE_TONE.Error,
    title: 'Your message was not sent',
    message: 'Check your connection and try again.',
    retry: null,
    ...overrides,
  };
}

describe('ContactNotice', () => {
  it('keeps an empty live region mounted so a later announcement is heard', () => {
    render(<ContactNotice notice={null} />);

    const region = screen.getByTestId(TEST_IDS.contactNotice);
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toBeEmptyDOMElement();
  });

  it('renders the title and message of the current notice', () => {
    render(<ContactNotice notice={notice()} />);

    const region = screen.getByTestId(TEST_IDS.contactNotice);
    expect(region).toHaveTextContent('Your message was not sent');
    expect(region).toHaveTextContent('Check your connection and try again.');
  });

  it('carries the tone modifier so success and failure never look alike', () => {
    const { rerender } = render(
      <ContactNotice notice={notice({ tone: CONTACT_NOTICE_TONE.Success })} />,
    );
    expect(screen.getByTestId(TEST_IDS.contactNotice)).toHaveClass('app-contact-notice--success');

    rerender(<ContactNotice notice={notice({ tone: CONTACT_NOTICE_TONE.Warning })} />);
    expect(screen.getByTestId(TEST_IDS.contactNotice)).toHaveClass('app-contact-notice--warning');

    rerender(<ContactNotice notice={notice({ tone: CONTACT_NOTICE_TONE.Error })} />);
    expect(screen.getByTestId(TEST_IDS.contactNotice)).toHaveClass('app-contact-notice--error');
  });

  it('offers no retry when re-sending could not help', () => {
    render(<ContactNotice notice={notice({ retry: null })} />);

    expect(screen.queryByTestId(TEST_IDS.contactNoticeRetry)).not.toBeInTheDocument();
  });

  it('runs the retry handler when a retryable failure is retried', () => {
    const onRetry = vi.fn();
    render(<ContactNotice notice={notice({ retry: { label: 'Try again', onRetry } })} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.contactNoticeRetry));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
