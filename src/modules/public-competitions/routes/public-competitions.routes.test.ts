import { describe, expect, it } from 'vitest';

import { ROUTE_ACCESS } from '@/shared/types';

import { getPublicCompetitionsRouteDefinitions } from './public-competitions.routes';

const DEFINITIONS = getPublicCompetitionsRouteDefinitions();

describe('getPublicCompetitionsRouteDefinitions', () => {
  it('registers the list and the detail screen', () => {
    expect(DEFINITIONS.map((definition) => definition.path)).toEqual([
      '/results',
      '/results/:competitionSlug',
    ]);
  });

  it('keeps both screens readable signed in or out', () => {
    for (const definition of DEFINITIONS) {
      expect(definition.access).toBe(ROUTE_ACCESS.Public);
      expect(definition.exact).toBe(true);
      expect(definition.component).toBeTypeOf('function');
    }
  });

  it('carries no permission or team-scope metadata', () => {
    for (const definition of DEFINITIONS) {
      expect(definition.meta).toBeUndefined();
    }
  });
});
