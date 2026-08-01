import { ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { ContactContainer } from '../containers/contact.container';
import { contactPath } from './contact.paths';

/**
 * Public, not PublicOnly: the Contact page is static marketing content plus
 * a form, useful whether or not a visitor is signed in.
 */
export function getContactRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: contactPath(),
      exact: true,
      access: ROUTE_ACCESS.Public,
      component: ContactContainer,
    },
  ];
}
