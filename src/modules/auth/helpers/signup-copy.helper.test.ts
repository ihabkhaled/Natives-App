import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import { buildSignupCopy } from './signup-copy.helper';

/** Echoes the key so every slot can be traced back to the key it renders. */
const echo = (key: string): string => key;

describe('buildSignupCopy', () => {
  it('resolves the panel copy from the signup catalog', () => {
    const copy = buildSignupCopy(echo);

    expect(copy.title).toBe(I18N_KEYS.signup.title);
    expect(copy.intro).toBe(I18N_KEYS.signup.intro);
    expect(copy.haveAccount).toBe(I18N_KEYS.signup.haveAccount);
    expect(copy.logoLabel).toBe(I18N_KEYS.brand.logoAlt);
    expect(copy.backToLogin).toBe(I18N_KEYS.auth.backToLogin);
  });

  it('resolves every form label, hint, and progress announcement', () => {
    const { form } = buildSignupCopy(echo);

    expect(form.displayNameLabel).toBe(I18N_KEYS.signup.displayNameLabel);
    expect(form.emailPlaceholder).toBe(I18N_KEYS.signup.emailPlaceholder);
    expect(form.passwordHint).toBe(I18N_KEYS.signup.passwordHint);
    expect(form.statusSubmitting).toBe(I18N_KEYS.signup.statusSubmitting);
    expect(form.capsLockWarning).toBe(I18N_KEYS.auth.capsLockWarning);
  });

  it('describes the awaiting-approval state, including the three next steps', () => {
    const { pending } = buildSignupCopy(echo);

    expect(pending.title).toBe(I18N_KEYS.signup.pendingTitle);
    expect(pending.message).toBe(I18N_KEYS.signup.pendingMessage);
    expect(pending.steps).toEqual([
      I18N_KEYS.signup.pendingStepReview,
      I18N_KEYS.signup.pendingStepEmail,
      I18N_KEYS.signup.pendingStepSignIn,
    ]);
  });

  it('leaves no slot untranslated', () => {
    const copy = buildSignupCopy(() => 'translated');
    const formValues = Object.keys(copy.form).map(
      (key) => copy.form[key as keyof typeof copy.form],
    );
    const values: readonly string[] = [
      ...formValues,
      copy.pending.title,
      copy.pending.message,
      copy.pending.stepsTitle,
      ...copy.pending.steps,
      copy.title,
      copy.logoLabel,
      copy.intro,
      copy.haveAccount,
      copy.backToLogin,
    ];

    expect(values.every((value) => value === 'translated')).toBe(true);
  });
});
