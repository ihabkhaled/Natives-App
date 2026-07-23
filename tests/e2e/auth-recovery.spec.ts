import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';
import { MOCK_INVITATION, MOCK_RESET, MOCK_STRONG_PASSWORD } from '@/tests/msw/mock-data.constants';

import { expectPresentedPage, fillIonInput, gotoApp, login } from './fixtures/app.fixture';

test.describe('password recovery', () => {
  test('requests a reset link with an enumeration-safe confirmation', async ({ page }) => {
    await gotoApp(page, '/login');
    await page.getByTestId(TEST_IDS.loginForgotPasswordLink).click();
    await expectPresentedPage(page, TEST_IDS.forgotPasswordPage);

    await fillIonInput(page, TEST_IDS.forgotPasswordEmailInput, 'someone@example.com');
    await page.getByTestId(TEST_IDS.forgotPasswordSubmitButton).click();

    await expect(page.getByTestId(TEST_IDS.forgotPasswordSuccess)).toContainText(
      'If an account exists',
    );
  });

  test('resets the password from a valid link', async ({ page }) => {
    await gotoApp(page, `/reset-password?token=${MOCK_RESET.validToken}`);
    await expectPresentedPage(page, TEST_IDS.resetPasswordPage);

    await fillIonInput(page, TEST_IDS.setPasswordInput, MOCK_STRONG_PASSWORD);
    await fillIonInput(page, TEST_IDS.setPasswordConfirmInput, MOCK_STRONG_PASSWORD);
    await page.getByTestId(TEST_IDS.setPasswordSubmitButton).click();

    await expect(page.getByTestId(TEST_IDS.resetPasswordStatus)).toContainText('Password updated');
  });

  test('shows a sanitized state for a reset link without a token', async ({ page }) => {
    await gotoApp(page, '/reset-password');

    await expect(page.getByTestId(TEST_IDS.resetPasswordStatus)).toContainText(
      'Link no longer works',
    );
  });

  test('blocks a weak password with an accessible validation summary', async ({ page }) => {
    await gotoApp(page, `/reset-password?token=${MOCK_RESET.validToken}`);

    await fillIonInput(page, TEST_IDS.setPasswordInput, 'weak');
    await fillIonInput(page, TEST_IDS.setPasswordConfirmInput, 'weak');
    await page.getByTestId(TEST_IDS.setPasswordSubmitButton).click();

    await expect(page.getByTestId(TEST_IDS.setPasswordSummary)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.resetPasswordPage)).toBeVisible();
  });
});

test.describe('invitation acceptance', () => {
  test('accepts an invitation and lands on the authenticated home screen', async ({ page }) => {
    await gotoApp(page, `/accept-invitation?token=${MOCK_INVITATION.validToken}`);
    await expect(page.getByTestId(TEST_IDS.acceptInvitationEmail)).toContainText(
      MOCK_INVITATION.email,
    );
    // The intro names the invited TEAM and the role acceptance will grant.
    await expect(page.getByText(/invited to join Cairo Natives/u)).toContainText('Coach');

    await fillIonInput(page, TEST_IDS.setPasswordDisplayNameInput, 'Invited Ranger');
    await fillIonInput(page, TEST_IDS.setPasswordInput, MOCK_STRONG_PASSWORD);
    await fillIonInput(page, TEST_IDS.setPasswordConfirmInput, MOCK_STRONG_PASSWORD);
    await page.getByTestId(TEST_IDS.setPasswordSubmitButton).click();

    await expectPresentedPage(page, TEST_IDS.homePage);
  });

  test('shows a sanitized state for an expired invitation', async ({ page }) => {
    await gotoApp(page, `/accept-invitation?token=${MOCK_INVITATION.expiredToken}`);

    await expect(page.getByTestId(TEST_IDS.acceptInvitationStatus)).toContainText(
      'Invitation unavailable',
    );
  });

  test('@rtl renders the localized branded invitation right-to-left', async ({ page }) => {
    await gotoApp(page, '/settings');
    await page
      .getByTestId(TEST_IDS.settingsLocaleSelect)
      .locator('ion-segment-button[value="ar"]')
      .click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    await gotoApp(page, `/accept-invitation?token=${MOCK_INVITATION.validToken}`);

    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByTestId(TEST_IDS.acceptInvitationPage)).toContainText('Cairo Natives');
    await expect(page.getByTestId(TEST_IDS.acceptInvitationPage)).toContainText('مدرّب');
    await expect(page.getByTestId(TEST_IDS.acceptInvitationEmail)).toContainText(
      MOCK_INVITATION.email,
    );
  });
});

test.describe('session management', () => {
  test('lists devices and revokes another session', async ({ page }) => {
    await login(page);
    await expectPresentedPage(page, TEST_IDS.homePage);

    await page.getByTestId(TEST_IDS.homeSessionsLink).click();
    await expectPresentedPage(page, TEST_IDS.sessionsPage);

    await expect(page.getByTestId(TEST_IDS.sessionItem)).toHaveCount(3);
    await page.getByTestId(TEST_IDS.sessionRevokeButton).first().click();

    await expect(page.getByTestId(TEST_IDS.sessionItem)).toHaveCount(2);
  });
});
