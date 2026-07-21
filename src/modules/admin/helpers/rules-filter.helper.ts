import { I18N_KEYS } from '@/shared/i18n';
import type { SelectFieldOption } from '@/shared/ui';

import { RULE_STATUS_LABEL_KEYS } from '../constants/admin-labels.constants';
import {
  ALL_STATUSES_FILTER,
  RULE_FAMILIES,
  RULE_STATUSES,
  type RuleFamily,
} from '../constants/admin.constants';
import type { GovernedRule } from '../types/admin.types';

type Translate = (key: string) => string;

const FAMILY_LABEL_KEYS: Record<RuleFamily, string> = {
  points: I18N_KEYS.adminRules.familyPoints,
  calculation: I18N_KEYS.adminRules.familyCalculation,
};

export function buildFamilyOptions(t: Translate): readonly SelectFieldOption[] {
  return RULE_FAMILIES.map((family) => ({ value: family, label: t(FAMILY_LABEL_KEYS[family]) }));
}

export function buildStatusOptions(t: Translate): readonly SelectFieldOption[] {
  return [
    { value: ALL_STATUSES_FILTER, label: t(I18N_KEYS.adminRules.statusAll) },
    ...RULE_STATUSES.map((status) => ({
      value: status,
      label: t(RULE_STATUS_LABEL_KEYS[status]),
    })),
  ];
}

/** Client-side narrowing of an already-bounded page. */
export function filterRules(
  rules: readonly GovernedRule[],
  statusFilter: string,
): readonly GovernedRule[] {
  return statusFilter === ALL_STATUSES_FILTER
    ? rules
    : rules.filter((rule) => rule.status === statusFilter);
}
