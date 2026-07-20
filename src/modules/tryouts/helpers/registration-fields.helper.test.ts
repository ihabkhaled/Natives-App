import { describe, expect, it, vi } from 'vitest';

import { buildTryoutEvent } from '../../../../tests/factories/tryouts.factory';
import {
  buildRegistrationChrome,
  buildRegistrationFields,
  buildRegistrationLabels,
} from './registration-fields.helper';
import { EMPTY_REGISTRATION_DRAFT, type RegistrationDraft } from './registration-form.helper';

const t = (key: string): string => key;
const instant = (iso: string): string => `cairo:${iso}`;

const event = buildTryoutEvent;

describe('buildRegistrationFields', () => {
  it('writes each edit back through the patch function', () => {
    const patch = vi.fn();
    const fields = buildRegistrationFields(t, EMPTY_REGISTRATION_DRAFT, patch);

    fields.name.onChange('Sara');
    fields.preferred.onChange('Soso');
    fields.email.onChange('sara@example.test');
    fields.phone.onChange('0100');
    fields.birthYear.onChange('2001');

    const changes = patch.mock.calls.map((call) => call[0] as Partial<RegistrationDraft>);

    expect(changes).toEqual([
      { fullName: 'Sara' },
      { preferredName: 'Soso' },
      { email: 'sara@example.test' },
      { phone: '0100' },
      { birthYear: '2001' },
    ]);
  });

  it('keeps optional fields free of validation noise', () => {
    const fields = buildRegistrationFields(t, EMPTY_REGISTRATION_DRAFT, vi.fn());

    expect(fields.preferred.errorMessage).toBeNull();
    expect(fields.phone.errorMessage).toBeNull();
    expect(fields.name.errorMessage).toBeNull();
  });

  it('surfaces a validation message for each typed, invalid field', () => {
    const fields = buildRegistrationFields(
      t,
      { ...EMPTY_REGISTRATION_DRAFT, fullName: '  ', email: 'nope', birthYear: '12' },
      vi.fn(),
    );

    expect(fields.email.errorMessage).toBe('tryouts.validationEmailInvalid');
    expect(fields.birthYear.errorMessage).toBe('tryouts.validationBirthYearInvalid');
  });
});

describe('buildRegistrationChrome', () => {
  it('offers no event and no capacity notice before the list arrives', () => {
    const chrome = buildRegistrationChrome(t, {
      events: [],
      selected: null,
      consentGiven: false,
      isSubmitting: false,
      formatInstant: instant,
    });

    expect(chrome.eventValue).toBe('');
    expect(chrome.eventOptions).toEqual([]);
    expect(chrome.capacityNotice).toBeNull();
    expect(chrome.consentError).toBe('tryouts.consentRequired');
    expect(chrome.submitLabel).toBe('tryouts.registrationSubmit');
  });

  it('labels each event with its Cairo instant', () => {
    const chrome = buildRegistrationChrome(t, {
      events: [event()],
      selected: event(),
      consentGiven: true,
      isSubmitting: false,
      formatInstant: instant,
    });

    expect(chrome.eventOptions[0]?.label).toContain('cairo:2026-08-15T15:00:00.000Z');
    expect(chrome.consentError).toBeNull();
  });

  it('warns when the chosen session is already full', () => {
    const full = event({ capacity: 2, registeredCount: 2 });
    const chrome = buildRegistrationChrome(t, {
      events: [full],
      selected: full,
      consentGiven: true,
      isSubmitting: true,
      formatInstant: instant,
    });

    expect(chrome.capacityNotice).toBe('tryouts.capacityFullNotice');
    expect(chrome.submitLabel).toBe('tryouts.registrationSubmitting');
  });
});

describe('buildRegistrationLabels', () => {
  it('resolves every static label from the catalog', () => {
    const labels = buildRegistrationLabels(t);

    expect(labels.consentStatement).toBe('tryouts.consentStatement');
    expect(labels.privacyNotice).toBe('tryouts.privacyNotice');
    expect(labels.eventLabel).toBe('tryouts.registrationEventLabel');
  });
});
