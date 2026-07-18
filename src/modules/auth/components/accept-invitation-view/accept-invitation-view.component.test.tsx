import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildSetPasswordFieldsLabelsFixture,
  buildSetPasswordFormView,
} from '../../../../../tests/factories/auth-view.factory';
import { AcceptInvitationView } from './accept-invitation-view.component';

describe('AcceptInvitationView', () => {
  it('shows who invited the user, their email, and the password form', () => {
    render(
      <AcceptInvitationView
        introMessage="Coach Nadia invited you to join Ultimate Natives as a member."
        emailLabel="Your email"
        invitationEmail="invitee@example.com"
        fieldsLabels={buildSetPasswordFieldsLabelsFixture({ submit: 'Create account' })}
        form={buildSetPasswordFormView()}
        isSubmitting={false}
        submitErrorMessage={undefined}
      />,
    );

    expect(
      screen.getByText('Coach Nadia invited you to join Ultimate Natives as a member.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.acceptInvitationEmail)).toHaveTextContent(
      'invitee@example.com',
    );
    expect(screen.getByTestId(TEST_IDS.setPasswordSubmitButton)).toHaveTextContent(
      'Create account',
    );
  });
});
