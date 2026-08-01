import { describe, expect, it } from 'vitest';

import { ROUTE_ACCESS } from '@/shared/types';

import { ContactContainer } from '../containers/contact.container';
import { contactPath } from './contact.paths';
import { getContactRouteDefinitions } from './contact.routes';

describe('getContactRouteDefinitions', () => {
  it('exposes exactly the contact route', () => {
    const definitions = getContactRouteDefinitions();

    expect(definitions).toHaveLength(1);
    expect(definitions[0]!.path).toBe(contactPath());
  });

  it('keeps the contact screen public for signed-in and signed-out visitors alike', () => {
    const [contact] = getContactRouteDefinitions();

    expect(contact!.path).toBe('/contact');
    expect(contact!.exact).toBe(true);
    expect(contact!.access).toBe(ROUTE_ACCESS.Public);
    expect(contact!.component).toBe(ContactContainer);
  });
});
