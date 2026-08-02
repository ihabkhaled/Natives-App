import { vi } from 'vitest';

import type { ContactScreenView } from '@/modules/contact';

/** Deterministic Contact-screen view model shared by the container and component tests. */
export function buildContactScreenView(
  overrides: Partial<ContactScreenView> = {},
): ContactScreenView {
  return {
    path: '/contact',
    seoTitle: 'Contact Us — Ultimate Natives',
    seoDescription: 'Get in touch with Ultimate Natives.',
    heroEyebrow: 'Get in touch',
    heroTitle: 'Contact Us',
    heroIntro: 'Have a question? Send us a message below.',
    isFormEnabled: true,
    notice: null,
    emailLabel: 'Your email',
    emailPlaceholder: 'you@example.com',
    subjectLabel: 'Subject',
    subjectPlaceholder: 'What is this about?',
    messageLabel: 'Message',
    messagePlaceholder: 'Tell us more…',
    submitLabel: 'Send message',
    submittingLabel: 'Sending…',
    isSubmitting: false,
    form: {
      email: {
        name: 'email',
        value: '',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        errorMessage: undefined,
      },
      subject: {
        name: 'subject',
        value: '',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        errorMessage: undefined,
      },
      message: {
        name: 'message',
        value: '',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        errorMessage: undefined,
      },
      onSubmit: vi.fn(),
      reset: vi.fn(),
    },
    socialHeading: 'Find us online',
    socialIntro: 'Follow along on any of these.',
    socialLinks: [
      {
        key: 'facebook',
        href: 'https://www.facebook.com/ultimatenatives',
        label: 'www.facebook.com/ultimatenatives',
      },
      {
        key: 'instagram',
        href: 'https://www.instagram.com/ultimatenatives',
        label: 'www.instagram.com/ultimatenatives',
      },
      {
        key: 'tiktok',
        href: 'https://www.tiktok.com/@ultimate.natives',
        label: 'www.tiktok.com/@ultimate.natives',
      },
    ],
    ...overrides,
  };
}
