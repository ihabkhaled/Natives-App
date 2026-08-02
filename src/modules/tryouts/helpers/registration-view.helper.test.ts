import { describe, expect, it, vi } from 'vitest';

import { buildTryoutEvent } from '../../../../tests/factories/tryouts.factory';
import type { TryoutEvent } from '../types/tryouts.types';
import { EMPTY_REGISTRATION_DRAFT, type RegistrationDraft } from './registration-form.helper';
import { buildRegistrationFormView } from './registration-view.helper';

const t = (key: string): string => key;

const COMPLETE: RegistrationDraft = {
  ...EMPTY_REGISTRATION_DRAFT,
  fullName: 'Sara Nabil',
  email: 'sara@example.test',
  consentGiven: true,
};

interface FormOverrides {
  readonly draft?: RegistrationDraft;
  readonly selected?: TryoutEvent | null;
  readonly isSubmitting?: boolean;
  readonly hasFailed?: boolean;
}

function form(overrides: FormOverrides = {}) {
  const selected = overrides.selected === undefined ? buildTryoutEvent() : overrides.selected;
  return buildRegistrationFormView(t, {
    draft: overrides.draft ?? EMPTY_REGISTRATION_DRAFT,
    patch: vi.fn(),
    events: selected === null ? [] : [selected],
    selected,
    isSubmitting: overrides.isSubmitting ?? false,
    hasFailed: overrides.hasFailed ?? false,
    formatInstant: (iso: string) => `cairo:${iso}`,
    onEventChange: vi.fn(),
    onConsentChange: vi.fn(),
    onSubmit: vi.fn(),
  });
}

describe('buildRegistrationFormView', () => {
  it('names the session the candidate is applying for', () => {
    expect(form().intro).toBe('tryouts.publicFormIntro');
  });

  it('prompts for a session when the list produced none', () => {
    const view = form({ selected: null });

    expect(view.intro).toBe('tryouts.publicSelectPrompt');
    expect(view.blockedNotice).toBeNull();
    expect(view.canSubmit).toBe(false);
  });

  it('blocks a closed session with a reason instead of accepting an application', () => {
    const view = form({ draft: COMPLETE, selected: buildTryoutEvent({ status: 'closed' }) });

    expect(view.blockedNotice).toBe('tryouts.publicClosedNotice');
    expect(view.canSubmit).toBe(false);
  });

  it('unlocks submit once an open session has a complete, consented draft', () => {
    expect(form({ draft: COMPLETE }).canSubmit).toBe(true);
  });

  it('keeps submit locked without consent', () => {
    expect(form({ draft: { ...COMPLETE, consentGiven: false } }).canSubmit).toBe(false);
  });

  it('locks submit while a request is already in flight, and announces the wait', () => {
    const view = form({ draft: COMPLETE, isSubmitting: true });

    expect(view.canSubmit).toBe(false);
    expect(view.isSubmitting).toBe(true);
    expect(view.statusMessage).toBe('tryouts.publicSubmittingStatus');
  });

  it('says nothing was saved after a failed attempt', () => {
    expect(form({ draft: COMPLETE, hasFailed: true }).statusMessage).toBe(
      'tryouts.publicSubmitFailed',
    );
  });

  it('stays silent while nothing has happened', () => {
    expect(form({ draft: COMPLETE }).statusMessage).toBeNull();
  });

  it('carries the labels, the picker, and the consent gate through', () => {
    const view = form({ draft: COMPLETE });

    expect(view.heading).toBe('tryouts.publicFormHeading');
    expect(view.emailLabel).toBe('tryouts.registrationEmailLabel');
    expect(view.eventValue).toBe('try-1');
    expect(view.eventOptions[0]?.label).toContain('cairo:2026-08-15T15:00:00.000Z');
    expect(view.consentError).toBeNull();
  });
});
