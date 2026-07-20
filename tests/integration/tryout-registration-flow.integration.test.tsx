import { fireEvent, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { TryoutRegistrationContainer } from '@/modules/tryouts/containers/tryout-registration.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_TRYOUTS } from '@/tests/msw/tryouts.fixture';

import { initTestI18n } from '../setup/i18n-test.helper';
import { clearSessionAfterTest, resetSessionForTest } from '../setup/integration-session.helper';
import { fireIonChange, fireIonCheckboxChange, fireIonInput } from '../setup/ionic-events.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

function renderRegistration(): void {
  renderRoute('/tryout-registration', '/tryout-registration', <TryoutRegistrationContainer />);
}

/** Fill the minimum a candidate must supply, without ticking consent. */
async function fillMinimum(email = 'new.candidate@example.test'): Promise<void> {
  await screen.findByTestId(TEST_IDS.tryoutRegistrationSubmit, {}, WAIT);
  fireIonInput(screen.getByTestId(TEST_IDS.tryoutRegistrationName), 'Sara Nabil');
  fireIonInput(screen.getByTestId(TEST_IDS.tryoutRegistrationEmail), email);
}

/** Fill, consent, and submit; the outcome panel is the assertion target. */
async function submitRegistration(email?: string): Promise<void> {
  await fillMinimum(email);
  giveConsent();
  await waitFor(() => {
    expect(screen.getByTestId(TEST_IDS.tryoutRegistrationSubmit)).not.toBeDisabled();
  });
  fireEvent.click(screen.getByTestId(TEST_IDS.tryoutRegistrationSubmit));
}

function giveConsent(): void {
  fireIonCheckboxChange(screen.getByTestId(TEST_IDS.tryoutRegistrationConsent), true);
}

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('public tryout registration (no session)', () => {
  it('renders the form for an anonymous visitor and says the service is pending', async () => {
    renderRegistration();

    await screen.findByTestId(TEST_IDS.tryoutRegistrationSubmit, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.tryoutRegistrationView)).toHaveTextContent(
      'tryouts service is not deployed yet',
    );
  });

  it('states up front how the collected details are used', async () => {
    renderRegistration();

    const privacy = await screen.findByTestId(TEST_IDS.tryoutRegistrationPrivacy, {}, WAIT);
    expect(privacy).toHaveTextContent('never shown in candidate lists');
  });

  it('keeps the submit disabled until consent is given', async () => {
    renderRegistration();
    await fillMinimum();

    expect(screen.getByTestId(TEST_IDS.tryoutRegistrationSubmit)).toBeDisabled();
    expect(screen.getByTestId(TEST_IDS.tryoutRegistrationView)).toHaveTextContent(
      'Consent is required',
    );
  });

  it('shows the consent version the candidate is accepting', async () => {
    renderRegistration();

    await screen.findByTestId(TEST_IDS.tryoutRegistrationSubmit, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.tryoutRegistrationView)).toHaveTextContent(
      MOCK_TRYOUTS.consentVersion,
    );
  });

  it('rejects a malformed email before anything is sent', async () => {
    renderRegistration();
    await fillMinimum('not-an-email');
    giveConsent();

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.tryoutRegistrationSubmit)).toBeDisabled();
    });
    expect(screen.getByTestId(TEST_IDS.tryoutRegistrationEmail)).toHaveClass('ion-invalid');
  });

  it('rejects an implausible birth year rather than coercing it', async () => {
    renderRegistration();
    await fillMinimum();
    fireIonInput(screen.getByTestId(TEST_IDS.tryoutRegistrationBirthYear), '12');
    giveConsent();

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.tryoutRegistrationBirthYear)).toHaveClass('ion-invalid');
    });
    expect(screen.getByTestId(TEST_IDS.tryoutRegistrationSubmit)).toBeDisabled();
  });

  it('registers a consenting candidate and shows the reference', async () => {
    renderRegistration();
    await submitRegistration();

    const success = await screen.findByTestId(TEST_IDS.tryoutRegistrationSuccess, {}, WAIT);
    expect(success).toHaveTextContent('You are registered');
    expect(success).toHaveTextContent('UN-2026-0099');
  });

  it('reports a duplicate registration instead of creating a second record', async () => {
    renderRegistration();
    await submitRegistration(MOCK_TRYOUTS.duplicateEmail);

    const result = await screen.findByTestId(TEST_IDS.tryoutRegistrationSuccess, {}, WAIT);
    expect(result).toHaveTextContent('Already registered');
  });

  it('waitlists into a full session and says so', async () => {
    renderRegistration();
    await screen.findByTestId(TEST_IDS.tryoutRegistrationEvent, {}, WAIT);
    fireIonChange(screen.getByTestId(TEST_IDS.tryoutRegistrationEvent), MOCK_TRYOUTS.fullEventId);

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.tryoutRegistrationView)).toHaveTextContent(
        'This session is full',
      );
    });

    await submitRegistration('wait@example.test');

    const result = await screen.findByTestId(TEST_IDS.tryoutRegistrationSuccess, {}, WAIT);
    expect(result).toHaveTextContent('You are on the waitlist');
  });

  it('renders the designed error state when the event list fails', async () => {
    mockApiServer.use(
      http.get('*/public/tryout-events', () =>
        HttpResponse.json({ statusCode: 500, code: 'INTERNAL_ERROR' }, { status: 500 }),
      ),
    );
    renderRegistration();

    expect(await screen.findByTestId(TEST_IDS.tryoutsError, {}, WAIT)).toBeInTheDocument();
  });

  it('keeps the form on screen when the registration call fails', async () => {
    mockApiServer.use(
      http.post('*/public/tryout-registrations', () =>
        HttpResponse.json({ statusCode: 500, code: 'INTERNAL_ERROR' }, { status: 500 }),
      ),
    );
    renderRegistration();
    await submitRegistration();

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.tryoutRegistrationSubmit)).toBeInTheDocument();
    });
    expect(screen.queryByTestId(TEST_IDS.tryoutRegistrationSuccess)).not.toBeInTheDocument();
  });
});
