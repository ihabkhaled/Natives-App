import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { TryoutRegistrationContainer } from '@/modules/tryouts/containers/tryout-registration.container';
import { TEST_IDS } from '@/shared/config';
import {
  makeTryoutEventDto,
  makeTryoutEventsResponse,
  MOCK_TRYOUTS,
  resetMockTryoutsState,
} from '@/tests/msw/tryouts.fixture';

import { initTestI18n } from '../setup/i18n-test.helper';
import { clearSessionAfterTest, resetSessionForTest } from '../setup/integration-session.helper';
import { fireIonCheckboxChange, fireIonInput } from '../setup/ionic-events.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };
const PUBLIC_EVENTS = '*/public/tryout-events';
const PUBLIC_REGISTRATIONS = '*/public/tryout-registrations';

function renderPublicTryouts(): void {
  renderRoute('/tryout-registration', '/tryout-registration', <TryoutRegistrationContainer />);
}

function serveEvents(...events: readonly ReturnType<typeof makeTryoutEventDto>[]): void {
  mockApiServer.use(
    http.get(PUBLIC_EVENTS, () => HttpResponse.json(makeTryoutEventsResponse(events))),
  );
}

/** Fill the minimum a candidate must supply, without ticking consent. */
async function fillMinimum(email = 'new.candidate@example.test'): Promise<void> {
  await screen.findByTestId(TEST_IDS.tryoutRegistrationSubmit, {}, WAIT);
  fireIonInput(screen.getByTestId(TEST_IDS.tryoutRegistrationName), 'Sara Nabil');
  fireIonInput(screen.getByTestId(TEST_IDS.tryoutRegistrationEmail), email);
}

function giveConsent(): void {
  fireIonCheckboxChange(screen.getByTestId(TEST_IDS.tryoutRegistrationConsent), true);
}

/** Fill, consent, and submit; the outcome panel is the assertion target. */
async function submitApplication(email?: string): Promise<void> {
  await fillMinimum(email);
  giveConsent();
  await waitFor(() => {
    expect(screen.getByTestId(TEST_IDS.tryoutRegistrationSubmit)).not.toBeDisabled();
  });
  fireEvent.click(screen.getByTestId(TEST_IDS.tryoutRegistrationSubmit));
}

beforeEach(async () => {
  resetMockTryoutsState();
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('public tryouts page (no session)', () => {
  it('lists the open sessions for an anonymous visitor', async () => {
    renderPublicTryouts();

    const list = await screen.findByTestId(TEST_IDS.tryoutPublicSessions, {}, WAIT);
    const sessions = within(list).getAllByTestId(TEST_IDS.tryoutPublicSession);

    expect(sessions).toHaveLength(2);
    expect(sessions[0]).toHaveTextContent('Autumn intake — session 1');
    expect(sessions[0]).toHaveTextContent('Maadi Club pitch 1');
  });

  it('renders every instant in Cairo time, not the raw UTC value', async () => {
    renderPublicTryouts();

    const list = await screen.findByTestId(TEST_IDS.tryoutPublicSessions, {}, WAIT);

    // 15:00Z on 15 August 2026 is 18:00 in Africa/Cairo (UTC+3 in summer).
    expect(list).toHaveTextContent('Saturday, August 15, 2026');
    expect(list).toHaveTextContent('6:00 PM');
  });

  it('states up front how the collected details are used', async () => {
    renderPublicTryouts();

    const privacy = await screen.findByTestId(TEST_IDS.tryoutRegistrationPrivacy, {}, WAIT);

    expect(privacy).toHaveTextContent('never shown in candidate lists');
  });

  it('keeps the submit disabled until consent is given', async () => {
    renderPublicTryouts();
    await fillMinimum();

    expect(screen.getByTestId(TEST_IDS.tryoutRegistrationSubmit)).toBeDisabled();
    expect(screen.getByTestId(TEST_IDS.tryoutRegistrationView)).toHaveTextContent(
      'Consent is required',
    );
  });

  it('shows the consent version the candidate is accepting', async () => {
    renderPublicTryouts();

    await screen.findByTestId(TEST_IDS.tryoutRegistrationSubmit, {}, WAIT);

    expect(screen.getByTestId(TEST_IDS.tryoutRegistrationView)).toHaveTextContent(
      MOCK_TRYOUTS.consentVersion,
    );
  });

  it('rejects a malformed email before anything is sent', async () => {
    renderPublicTryouts();
    await fillMinimum('not-an-email');
    giveConsent();

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.tryoutRegistrationSubmit)).toBeDisabled();
    });
    expect(screen.getByTestId(TEST_IDS.tryoutRegistrationEmail)).toHaveClass('ion-invalid');
  });

  it('rejects an implausible birth year rather than coercing it', async () => {
    renderPublicTryouts();
    await fillMinimum();
    fireIonInput(screen.getByTestId(TEST_IDS.tryoutRegistrationBirthYear), '12');
    giveConsent();

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.tryoutRegistrationBirthYear)).toHaveClass('ion-invalid');
    });
    expect(screen.getByTestId(TEST_IDS.tryoutRegistrationSubmit)).toBeDisabled();
  });

  it('registers a consenting candidate and shows the reference', async () => {
    renderPublicTryouts();
    await submitApplication();

    const success = await screen.findByTestId(TEST_IDS.tryoutRegistrationSuccess, {}, WAIT);

    expect(success).toHaveTextContent('You are registered');
    expect(success).toHaveTextContent('UN-2026-0099');
  });

  it('lets a confirmed candidate start a second application', async () => {
    renderPublicTryouts();
    await submitApplication();
    await screen.findByTestId(TEST_IDS.tryoutRegistrationSuccess, {}, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.tryoutPublicApplyAnother));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.tryoutRegistrationSubmit)).toBeInTheDocument();
    });
    expect(screen.queryByTestId(TEST_IDS.tryoutRegistrationSuccess)).not.toBeInTheDocument();
  });

  it('reports a duplicate registration instead of creating a second record', async () => {
    renderPublicTryouts();
    await submitApplication(MOCK_TRYOUTS.duplicateEmail);

    const result = await screen.findByTestId(TEST_IDS.tryoutRegistrationSuccess, {}, WAIT);

    expect(result).toHaveTextContent('Already registered');
    expect(result).not.toHaveTextContent('Reference');
  });

  it('waitlists into a full session and says so before and after submitting', async () => {
    renderPublicTryouts();
    const list = await screen.findByTestId(TEST_IDS.tryoutPublicSessions, {}, WAIT);
    const full = within(list).getAllByTestId(TEST_IDS.tryoutPublicApply)[1]!;
    fireEvent.click(full);

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.tryoutRegistrationView)).toHaveTextContent(
        'This session is full',
      );
    });
    await submitApplication('wait@example.test');

    const result = await screen.findByTestId(TEST_IDS.tryoutRegistrationSuccess, {}, WAIT);

    expect(result).toHaveTextContent('You are on the waitlist');
  });

  it('blocks a closed session with a reason and no way in', async () => {
    serveEvents(makeTryoutEventDto({ status: 'closed', name: 'Spring intake' }));
    renderPublicTryouts();

    await screen.findByTestId(TEST_IDS.tryoutPublicSessions, {}, WAIT);

    expect(screen.getByTestId(TEST_IDS.tryoutPublicFormStatus)).toHaveTextContent(
      'Registration for this session is closed',
    );
    expect(screen.getByTestId(TEST_IDS.tryoutPublicApply)).toHaveProperty('disabled', true);
    expect(screen.getByTestId(TEST_IDS.tryoutRegistrationSubmit)).toBeDisabled();
  });

  it('says the venue is still to be confirmed rather than showing a blank', async () => {
    serveEvents(makeTryoutEventDto({ venueName: null }));
    renderPublicTryouts();

    const list = await screen.findByTestId(TEST_IDS.tryoutPublicSessions, {}, WAIT);

    expect(list).toHaveTextContent('Venue confirmed by email');
  });

  it('renders the designed empty state when no session is open', async () => {
    serveEvents();
    renderPublicTryouts();

    const empty = await screen.findByTestId(TEST_IDS.tryoutsEmpty, {}, WAIT);

    expect(empty).toHaveTextContent('No open tryouts right now');
    expect(screen.queryByTestId(TEST_IDS.tryoutRegistrationSubmit)).not.toBeInTheDocument();
  });

  it('renders the designed error state, and retrying recovers the list', async () => {
    mockApiServer.use(
      http.get(PUBLIC_EVENTS, () =>
        HttpResponse.json({ statusCode: 500, code: 'INTERNAL_ERROR' }, { status: 500 }),
      ),
    );
    renderPublicTryouts();
    const error = await screen.findByTestId(TEST_IDS.tryoutsError, {}, WAIT);
    mockApiServer.resetHandlers();
    fireEvent.click(within(error).getByText('Try again'));

    expect(await screen.findByTestId(TEST_IDS.tryoutPublicSessions, {}, WAIT)).toBeInTheDocument();
  });

  it('keeps the form filled and says nothing was saved when the call fails', async () => {
    mockApiServer.use(
      http.post(PUBLIC_REGISTRATIONS, () =>
        HttpResponse.json({ statusCode: 500, code: 'INTERNAL_ERROR' }, { status: 500 }),
      ),
    );
    renderPublicTryouts();
    await submitApplication();

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.tryoutPublicFormStatus)).toHaveTextContent('was not sent');
    });
    expect(screen.queryByTestId(TEST_IDS.tryoutRegistrationSuccess)).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.tryoutRegistrationName)).toHaveValue('Sara Nabil');
  });

  it('always explains what happens after an application', async () => {
    renderPublicTryouts();

    const steps = await screen.findByTestId(TEST_IDS.tryoutPublicSteps, {}, WAIT);

    expect(steps).toHaveTextContent('We confirm by email');
    expect(steps).toHaveTextContent('We come back to you');
  });
});
