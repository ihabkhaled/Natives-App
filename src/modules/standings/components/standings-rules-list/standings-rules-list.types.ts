import type { RuleFamilyView, RuleVersionView } from '../../types/standings-view.types';

export interface StandingsRulesListProps {
  readonly families: readonly RuleFamilyView[];
}

export interface RuleVersionCardProps {
  readonly version: RuleVersionView;
  readonly prominent: boolean;
}
