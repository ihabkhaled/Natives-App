import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildContactScreenView } from '../../../../../tests/factories/contact-screen-view.factory';
import { fireIonInput } from '../../../../../tests/setup/ionic-events.helper';

import type { ContactViewProps } from './contact-view.types';
import { ContactView } from './contact-view.component';

function view(overrides: Partial<ContactViewProps> = {}): ContactViewProps {
  return buildContactScreenView(overrides);
}

describe('ContactView', () => {
  it('renders the contact page shell', () => {
    render(<ContactView {...view()} />);

    expect(screen.getByTestId(TEST_IDS.contactPage)).toBeInTheDocument();
  });

  it('shows the hero title as the page heading', () => {
    render(<ContactView {...view({ heroTitle: 'Contact Us' })} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Contact Us');
  });

  it('announces the submit outcome through the live status region', () => {
    render(
      <ContactView
        {...view({
          notice: {
            tone: 'success',
            title: 'Message sent',
            message: 'We will reply to the email you gave us.',
            retry: null,
          },
        })}
      />,
    );

    const notice = screen.getByTestId(TEST_IDS.contactNotice);
    expect(notice).toHaveAttribute('role', 'status');
    expect(notice).toHaveAttribute('aria-live', 'polite');
    expect(notice).toHaveTextContent('Message sent');
    expect(notice).toHaveTextContent('We will reply to the email you gave us.');
  });

  it('keeps the live region mounted and silent while the form is idle', () => {
    render(<ContactView {...view({ notice: null })} />);

    expect(screen.getByTestId(TEST_IDS.contactNotice)).toBeEmptyDOMElement();
  });

  it('enables the submit button while the relay is switched on', () => {
    render(<ContactView {...view({ isFormEnabled: true })} />);

    expect(screen.getByTestId(TEST_IDS.contactSubmitButton)).toHaveProperty('disabled', false);
  });

  it('disables the form when the relay kill switch is off', () => {
    render(<ContactView {...view({ isFormEnabled: false })} />);

    expect(screen.getByTestId(TEST_IDS.contactSubmitButton)).toHaveProperty('disabled', true);
    expect(screen.getByTestId(TEST_IDS.contactEmailInput)).toHaveProperty('disabled', true);
  });

  it('shows the submitting label while a submission is in flight', () => {
    render(
      <ContactView
        {...view({ isSubmitting: true, submittingLabel: 'Sending…', submitLabel: 'Send message' })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.contactSubmitButton)).toHaveTextContent('Sending…');
  });

  it('renders every form field with its label and lets values change', () => {
    const onChange = vi.fn();
    render(
      <ContactView
        {...view({ form: { ...view().form, email: { ...view().form.email, onChange } } })}
      />,
    );

    const emailInput = screen.getByTestId(TEST_IDS.contactEmailInput);
    expect(emailInput).toBeInTheDocument();
    fireIonInput(emailInput, 'player@example.com');
    expect(onChange).toHaveBeenCalledWith('player@example.com');
  });

  it('surfaces field validation errors', () => {
    render(
      <ContactView
        {...view({
          form: {
            ...view().form,
            subject: {
              ...view().form.subject,
              errorMessage: 'Subject must be at least 3 characters.',
            },
          },
        })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.contactSubjectInput)).toHaveAttribute(
      'error-text',
      'Subject must be at least 3 characters.',
    );
  });

  it('lists every social link with its real, external URL', () => {
    render(<ContactView {...view()} />);

    const facebook = screen.getByTestId(`${TEST_IDS.contactSocialLink}-facebook`);
    expect(facebook).toHaveAttribute('href', 'https://www.facebook.com/ultimatenatives');
    expect(facebook).toHaveAttribute('target', '_blank');
    expect(facebook).toHaveAttribute('rel', 'noreferrer noopener');
  });

  it('publishes per-route SEO metadata', () => {
    render(<ContactView {...view({ seoTitle: 'Contact Us — Ultimate Natives' })} />);

    expect(document.title).toBe('Contact Us — Ultimate Natives');
  });
});
