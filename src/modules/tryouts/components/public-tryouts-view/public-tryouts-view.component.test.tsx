import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import type {
  PublicTryoutCardView,
  PublicTryoutsView as ScreenView,
  RegistrationFormView,
  RegistrationOutcomeView,
} from '../../types/public-tryouts-view.types';
import type { RegistrationFieldView } from '../../types/tryouts-view.types';
import { PublicTryoutCard } from '../public-tryout-card/public-tryout-card.component';
import { PublicTryoutOutcome } from '../public-tryout-outcome/public-tryout-outcome.component';
import { TryoutRegistrationForm } from '../tryout-registration-form/tryout-registration-form.component';
import { PublicTryoutsView } from './public-tryouts-view.component';

/** Inert in a UI-only assertion; the hook owns every real behaviour. */
const NOOP = (): void => {
  // deliberately does nothing
};

function field(value = ''): RegistrationFieldView {
  return { value, errorMessage: null, onChange: NOOP };
}

function card(overrides: Partial<PublicTryoutCardView> = {}): PublicTryoutCardView {
  return {
    id: 'open-1',
    name: 'Autumn intake',
    statusLabel: 'Registration open',
    statusTone: 'success',
    whenLabel: 'When',
    whenValue: 'Saturday, 15 August 2026',
    timeValue: '5:00 PM',
    whereLabel: 'Where',
    whereValue: 'Maadi pitch 1',
    placesLabel: 'Places',
    placesValue: '20 of 24 places left',
    waitlistValue: '1 on the waitlist',
    takenPercent: 17,
    isFull: false,
    isOpen: true,
    isSelected: false,
    applyLabel: 'Apply for this session',
    onApply: NOOP,
    ...overrides,
  };
}

function form(overrides: Partial<RegistrationFormView> = {}): RegistrationFormView {
  return {
    heading: 'Your application',
    intro: 'You are applying for Autumn intake.',
    eventLabel: 'Tryout event',
    eventValue: 'open-1',
    eventOptions: [{ value: 'open-1', label: 'Autumn intake' }],
    capacityNotice: null,
    blockedNotice: null,
    nameLabel: 'Full name',
    namePlaceholder: 'Your full name',
    name: field(),
    preferredLabel: 'Preferred name',
    preferred: field(),
    emailLabel: 'Email',
    emailPlaceholder: 'you@example.com',
    email: field(),
    phoneLabel: 'Phone',
    phone: field(),
    birthYearLabel: 'Year of birth',
    birthYear: field(),
    consentHeading: 'Consent',
    consentStatement: 'I agree to the tryout terms.',
    consentVersionLabel: 'Consent version tryout-consent-v1',
    consentGiven: false,
    consentError: 'Consent is required before you can register.',
    privacyHeading: 'How this is used',
    privacyNotice: 'Only staff with the grant can read your contact details.',
    submitLabel: 'Register',
    isSubmitting: false,
    canSubmit: false,
    statusMessage: null,
    onEventChange: NOOP,
    onConsentChange: NOOP,
    onSubmit: NOOP,
    ...overrides,
  };
}

function outcome(overrides: Partial<RegistrationOutcomeView> = {}): RegistrationOutcomeView {
  return {
    title: 'You are registered',
    message: 'Keep the reference below.',
    referenceLabel: 'Reference',
    reference: 'UN-2026-0099',
    tone: 'success',
    resetLabel: 'Apply for another session',
    onReset: NOOP,
    ...overrides,
  };
}

function screenView(overrides: Partial<ScreenView> = {}): ScreenView {
  return {
    loadingLabel: 'Loading the open sessions…',
    errorTitle: 'The sessions did not load',
    errorMessage: 'Something went wrong on our side.',
    retryLabel: 'Try again',
    onRetry: NOOP,
    offlineTitle: 'You are offline',
    offlineMessage: 'Reconnect to see the open sessions.',
    offlineNoticeLabel: 'Reconnect to see the open sessions.',
    isOffline: false,
    forbiddenTitle: 'Restricted',
    forbiddenMessage: 'This screen is not available to you.',
    emptyTitle: 'No open tryouts right now',
    emptyMessage: 'The next intake has not been announced yet.',
    status: 'ready',
    seoTitle: 'Tryouts — Ultimate Natives',
    seoDescription: 'Open tryout sessions in Cairo.',
    path: '/tryout-registration',
    eyebrow: 'Play with Ultimate Natives',
    title: 'Tryouts',
    intro: 'Pick a session and turn up with running shoes.',
    sessionsHeading: 'Open sessions',
    sessionsIntro: 'All times are Cairo time.',
    cards: [card()],
    stepsHeading: 'What happens next',
    steps: [{ key: 'confirm', title: 'We confirm by email', body: 'You get your reference.' }],
    form: form(),
    outcome: null,
    ...overrides,
  };
}

describe('PublicTryoutCard', () => {
  it('shows when, where, and how many places are left', () => {
    render(<PublicTryoutCard item={card()} />);

    expect(screen.getByText('Saturday, 15 August 2026')).toBeInTheDocument();
    expect(screen.getByText('Maadi pitch 1')).toBeInTheDocument();
    expect(screen.getByText('20 of 24 places left')).toBeInTheDocument();
    expect(screen.getByText('1 on the waitlist')).toBeInTheDocument();
  });

  it('omits the waitlist line when nobody is waiting', () => {
    render(<PublicTryoutCard item={card({ waitlistValue: null })} />);

    expect(screen.queryByText('1 on the waitlist')).not.toBeInTheDocument();
  });

  it('applies for its session when the action is pressed', () => {
    const onApply = vi.fn();
    render(<PublicTryoutCard item={card({ onApply })} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.tryoutPublicApply));

    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('offers no way in for a closed session', () => {
    render(<PublicTryoutCard item={card({ isOpen: false, applyLabel: 'Registration closed' })} />);

    // Ionic reflects disabled as a property on the custom element; the native
    // :disabled pseudo-state never applies, so jest-dom's toBeDisabled cannot.
    expect(screen.getByTestId(TEST_IDS.tryoutPublicApply)).toHaveProperty('disabled', true);
  });

  it('marks the chosen session', () => {
    render(<PublicTryoutCard item={card({ isSelected: true })} />);

    expect(screen.getByTestId(TEST_IDS.tryoutPublicSession)).toHaveClass(
      'app-public-session--selected',
    );
  });
});

describe('TryoutRegistrationForm', () => {
  it('keeps submit locked until the view says the draft is valid', () => {
    render(<TryoutRegistrationForm view={form()} />);

    // Ionic reflects disabled as a property on the custom element; the native
    // :disabled pseudo-state never applies, so jest-dom's toBeDisabled cannot.
    expect(screen.getByTestId(TEST_IDS.tryoutRegistrationSubmit)).toHaveProperty('disabled', true);
    expect(screen.getByText('Consent is required before you can register.')).toBeInTheDocument();
  });

  it('submits the form rather than relying on a click handler', () => {
    const onSubmit = vi.fn();
    render(<TryoutRegistrationForm view={form({ canSubmit: true, onSubmit })} />);
    fireEvent.submit(screen.getByRole('form', { name: 'Your application' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('announces a failed attempt in a polite live region', () => {
    render(
      <TryoutRegistrationForm view={form({ statusMessage: 'Your application was not sent.' })} />,
    );
    const status = screen.getByTestId(TEST_IDS.tryoutPublicFormStatus);

    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Your application was not sent.');
  });

  it('explains a closed session ahead of any other status', () => {
    render(
      <TryoutRegistrationForm
        view={form({ blockedNotice: 'Registration for this session is closed.' })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.tryoutPublicFormStatus)).toHaveTextContent(
      'Registration for this session is closed.',
    );
  });

  it('states up front how the collected details are used', () => {
    render(<TryoutRegistrationForm view={form()} />);

    expect(screen.getByTestId(TEST_IDS.tryoutRegistrationPrivacy)).toHaveTextContent(
      'Only staff with the grant can read your contact details.',
    );
  });
});

describe('PublicTryoutOutcome', () => {
  it('announces the outcome with its reference', () => {
    render(<PublicTryoutOutcome view={outcome()} />);
    const panel = screen.getByTestId(TEST_IDS.tryoutRegistrationSuccess);

    expect(panel).toHaveAttribute('aria-live', 'polite');
    expect(panel).toHaveTextContent('Reference: UN-2026-0099');
  });

  it('shows no reference when the server issued none', () => {
    render(
      <PublicTryoutOutcome view={outcome({ reference: null, title: 'Already registered' })} />,
    );

    expect(screen.getByTestId(TEST_IDS.tryoutRegistrationSuccess)).not.toHaveTextContent(
      'Reference',
    );
  });

  it('offers a way back to a fresh application', () => {
    const onReset = vi.fn();
    render(<PublicTryoutOutcome view={outcome({ onReset })} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.tryoutPublicApplyAnother));

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});

describe('PublicTryoutsView', () => {
  it('renders the hero, the sessions, and the form when the list is ready', () => {
    render(<PublicTryoutsView {...screenView()} />);

    expect(screen.getByText('Play with Ultimate Natives')).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.tryoutPublicSessions)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.tryoutRegistrationSubmit)).toBeInTheDocument();
  });

  it('publishes its own document title for the route', () => {
    render(<PublicTryoutsView {...screenView()} />);

    expect(document.title).toBe('Tryouts — Ultimate Natives');
  });

  it('replaces the form with the outcome once an application lands', () => {
    render(<PublicTryoutsView {...screenView({ outcome: outcome() })} />);

    expect(screen.getByTestId(TEST_IDS.tryoutRegistrationSuccess)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.tryoutRegistrationSubmit)).not.toBeInTheDocument();
  });

  it('shows the skeleton and no session list while the list loads', () => {
    render(<PublicTryoutsView {...screenView({ status: 'loading' })} />);

    expect(screen.getByTestId(TEST_IDS.tryoutsLoading)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.tryoutPublicSessions)).not.toBeInTheDocument();
  });

  it('shows the designed empty state when nothing is open', () => {
    render(<PublicTryoutsView {...screenView({ status: 'empty', cards: [] })} />);

    expect(screen.getByTestId(TEST_IDS.tryoutsEmpty)).toHaveTextContent(
      'No open tryouts right now',
    );
  });

  it('shows the error state with a retry action', () => {
    const onRetry = vi.fn();
    render(<PublicTryoutsView {...screenView({ status: 'error', onRetry })} />);
    fireEvent.click(screen.getByText('Try again'));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('keeps the "what happens next" panel in every state', () => {
    render(<PublicTryoutsView {...screenView({ status: 'error' })} />);

    expect(screen.getByTestId(TEST_IDS.tryoutPublicSteps)).toHaveTextContent('We confirm by email');
  });
});
