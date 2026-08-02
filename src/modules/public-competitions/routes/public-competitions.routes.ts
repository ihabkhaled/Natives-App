import { ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { PublicCompetitionDetailContainer } from '../containers/public-competition-detail.container';
import { PublicCompetitionsContainer } from '../containers/public-competitions.container';
import {
  publicCompetitionDetailPattern,
  publicCompetitionsPath,
} from './public-competitions.paths';

/**
 * Public, not PublicOnly: the showcase is marketing content that reads the
 * same signed in or out, and it carries no permission or team scope — the
 * backend showcase endpoints publish only what anyone may read.
 */
export function getPublicCompetitionsRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: publicCompetitionsPath(),
      exact: true,
      access: ROUTE_ACCESS.Public,
      component: PublicCompetitionsContainer,
    },
    {
      path: publicCompetitionDetailPattern(),
      exact: true,
      access: ROUTE_ACCESS.Public,
      component: PublicCompetitionDetailContainer,
    },
  ];
}
