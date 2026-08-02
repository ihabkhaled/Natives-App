import { fireEvent, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ContactContainer } from '@/modules/contact/containers/contact.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_CONTACT } from '@/tests/msw/contact.fixture';

import { apiUrl, registerIntegrationSession } from '../setup/integration-api.helper';
import { fireIonInput } from '../setup/ionic-events.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

function renderContact(): void {
  renderRoute('/contact', '/contact', <ContactContainer />);
}

/** Fill the form with a body the backend accepts, then submit it. */
function submitMessage(email: string = MOCK_CONTACT.senderEmail): void {
  fireIonInput(screen.getByTestId(TEST_IDS.contactEmailInput), email);
  fireIonInput(screen.getByTestId(TEST_IDS.contactSubjectInput), MOCK_CONTACT.subject);
  fireIonInput(screen.getByTestId(TEST_IDS.contactMessageInput), MOCK_CONTACT.message);
  fireEvent.submit(screen.getByTestId(TEST_IDS.contactForm));
}

async function noticeText(): Promise<HTMLElement> {
  const notice = screen.getByTestId(TEST_IDS.contactNotice);
  await waitFor(() => {
    expect(notice).not.toBeEmptyDOMElement();
  }, WAIT);
  return notice;
}

registerIntegrationSession();

describe('public contact form (no session)', () => {
  it('lets an anonymous visitor submit, then confirms and clears the form', async () => {
    renderContact();
    submitMessage();

    expect(await noticeText()).toHaveTextContent('Message sent');
    expect(screen.getByTestId(TEST_IDS.contactEmailInput)).toHaveProperty('value', '');
    expect(screen.getByTestId(TEST_IDS.contactMessageInput)).toHaveProperty('value', '');
  });

  it('never calls the endpoint when the client schema already rejects the body', async () => {
    let calls = 0;
    mockApiServer.use(
      http.post(apiUrl('/contact'), () => {
        calls += 1;
        return HttpResponse.json({ sent: true }, { status: 201 });
      }),
    );
    renderContact();
    fireIonInput(screen.getByTestId(TEST_IDS.contactEmailInput), 'not-an-email');
    fireEvent.submit(screen.getByTestId(TEST_IDS.contactForm));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.contactEmailInput)).toHaveAttribute(
        'error-text',
        'Enter a valid email address.',
      );
    }, WAIT);
    expect(calls).toBe(0);
  });

  it('marks the rejected field and keeps the draft when the backend answers 400', async () => {
    mockApiServer.use(
      http.post(apiUrl('/contact'), () =>
        HttpResponse.json(
          {
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            errors: [{ field: 'subject', code: 'LENGTH_OUT_OF_RANGE', message: 'too long' }],
            path: '/api/v1/contact',
            timestamp: '2026-07-16T12:00:00.000Z',
            requestId: 'mock-validation',
          },
          { status: 400 },
        ),
      ),
    );
    renderContact();
    submitMessage();

    expect(await noticeText()).toHaveTextContent('We could not send that message');
    expect(screen.getByTestId(TEST_IDS.contactSubjectInput)).toHaveAttribute(
      'error-text',
      'Our server did not accept this value.',
    );
    expect(screen.getByTestId(TEST_IDS.contactMessageInput)).toHaveProperty(
      'value',
      MOCK_CONTACT.message,
    );
  });

  it('says the inbox is unreachable, and offers a retry, when the channel is off (503)', async () => {
    renderContact();
    submitMessage(MOCK_CONTACT.channelDisabledEmail);

    expect(await noticeText()).toHaveTextContent('Our inbox is not reachable right now');
    expect(screen.getByTestId(TEST_IDS.contactNoticeRetry)).toBeInTheDocument();
  });

  it('resends the same message when a failed send is retried', async () => {
    let attempts = 0;
    mockApiServer.use(
      http.post(apiUrl('/contact'), () => {
        attempts += 1;
        return attempts === 1
          ? HttpResponse.json(
              { statusCode: 503, code: 'CONTACT_CHANNEL_UNAVAILABLE' },
              { status: 503 },
            )
          : HttpResponse.json({ sent: true }, { status: 201 });
      }),
    );
    renderContact();
    submitMessage();
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.contactNoticeRetry)).toBeInTheDocument();
    }, WAIT);

    fireEvent.click(screen.getByTestId(TEST_IDS.contactNoticeRetry));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.contactNotice)).toHaveTextContent('Message sent');
    }, WAIT);
    expect(attempts).toBe(2);
  });

  // The live relay used to answer 201 `{ sent: true }` while silently dropping
  // the mail once its send throttle saturated. The backend now answers 429, so
  // this is the path a real saturated throttle takes: say the message was NOT
  // delivered, keep the draft, and offer no retry that would only fail again.
  it('tells a rate-limited visitor the message was not delivered, and keeps the draft', async () => {
    renderContact();
    submitMessage(MOCK_CONTACT.rateLimitedEmail);

    const notice = await noticeText();
    expect(notice).toHaveTextContent('Too many messages');
    expect(notice).toHaveTextContent('was not delivered');
    expect(screen.queryByTestId(TEST_IDS.contactNoticeRetry)).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.contactMessageInput)).toHaveProperty(
      'value',
      MOCK_CONTACT.message,
    );
  });

  it('never shows a raw backend string when the send fails', async () => {
    mockApiServer.use(
      http.post(apiUrl('/contact'), () =>
        HttpResponse.json(
          {
            statusCode: 500,
            code: 'INTERNAL_ERROR',
            message: 'SMTP relay smtp.internal:587 EHOSTUNREACH',
          },
          { status: 500 },
        ),
      ),
    );
    renderContact();
    submitMessage();

    const notice = await noticeText();
    expect(notice).not.toHaveTextContent('smtp.internal');
    expect(notice).toHaveTextContent('Our inbox is not reachable right now');
  });
});
