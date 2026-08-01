import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import { contactPath } from './contact.paths';

describe('contactPath', () => {
  it('derives the contact route from the canonical route table', () => {
    expect(contactPath()).toBe(APP_PATHS.contact);
    expect(contactPath()).toBe('/contact');
  });
});
